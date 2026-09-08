import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useCallback } from "react";
import { paymentProofSignedUrlSeconds } from "../../../constants/payment.constants";
import { onlineOrdersQueryKey, orderQueueQueryKey } from "../../../keys/query.keys";
import type { IReviewOnlineOrderRequest } from "../../../models/data/order/order.request";
import { orderServices } from "../../../services/data/order/order.services";
import { supabaseError } from "../../../utils/supabase.utils";

/// A staff-signed URL for one receipt. The payment-proofs bucket is private, so
/// this is the only way to see the image at all — and the URL expires, so a
/// link copied out of devtools stops working rather than leaking indefinitely.
export const useProofUrlHook = (path: string | null | undefined) =>
  useQuery({
    queryKey: ["payment-proof", path],
    queryFn: () => orderServices.signedProofUrl(path as string),
    enabled: Boolean(path),
    // Refetched before the signature expires, so a drawer left open on the
    // counter does not end up showing a broken image.
    staleTime: (paymentProofSignedUrlSeconds - 60) * 1000,
    gcTime: paymentProofSignedUrlSeconds * 1000,
    retry: 1,
  });

/// The approval inbox. Reads the same query key the realtime hook fills, so
/// there is one fetch and one subscription however many admin screens are open.
export const useOnlineOrdersHook = () => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const query = useQuery({
    queryKey: [onlineOrdersQueryKey],
    queryFn: () => orderServices.getOnlineOrders(),
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: (request: IReviewOnlineOrderRequest) =>
      orderServices.reviewOnlineOrder(request),

    onSuccess: (order, variables) => {
      void queryClient.invalidateQueries({ queryKey: [onlineOrdersQueryKey] });
      // An approved order becomes an ordinary ticket, so the board has to know.
      void queryClient.invalidateQueries({ queryKey: [orderQueueQueryKey] });

      if (variables.approve) {
        notification.success({
          message: `${order.order_number} approved`,
          description: "It's on the queue board now.",
          placement: "bottomRight",
        });
        return;
      }

      // Frees the image immediately rather than waiting for the hourly purge —
      // the receipt is ~96% of what a rejected order costs in storage. The RPC
      // has already queued the path, so a failure here is a delay of an hour,
      // not an orphaned file: 0017 will pick it up.
      if (order.payment_proof_path) {
        void orderServices.deletePaymentProof(order.payment_proof_path);
      }

      notification.info({
        message: `${order.order_number} rejected`,
        description: "The customer can see your reason on their tracker.",
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't record that decision",
        description: supabaseError(error),
      });
    },
  });

  const approve = useCallback(
    (orderId: string) => mutation.mutateAsync({ orderId, approve: true }),
    [mutation],
  );

  const reject = useCallback(
    (orderId: string, reason: string) =>
      mutation.mutateAsync({ orderId, approve: false, reason }),
    [mutation],
  );

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isReviewing: mutation.isPending,
    approve,
    reject,
  };
};
