import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { OrderStatusEnum } from "../../../enums/order.enum";
import { orderQueryKey } from "../../../keys/query.keys";
import { orderServices } from "../../../services/data/order/order.services";
import { supabase } from "../../../utils/supabase.utils";

/// The customer's tracker. Realtime pushes the status change the instant the
/// barista advances the ticket; the poll is only a safety net for a dropped
/// socket, and it stops once the order reaches a terminal state.
export const useOrderStatusHook = (orderId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [orderQueryKey, orderId],
    queryFn: () => orderServices.getOrder(orderId as string),
    enabled: Boolean(orderId),
    staleTime: 0,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status) return 10_000;
      return status === OrderStatusEnum.Completed || status === OrderStatusEnum.Cancelled
        ? false
        : 10_000;
    },
  });

  useEffect(() => {
    if (!orderId) return;

    // Broadcast, not postgres_changes: guests have no select policy on orders,
    // and Realtime honours RLS, so row-change events would never reach them.
    // The trigger in migration 0005 sends to this topic instead.
    const channel = supabase
      .channel(`order:${orderId}`)
      .on("broadcast", { event: "status" }, () => {
        // The payload is only a hint — re-read through the RPC, which is the
        // one path allowed to return this order's full detail.
        void queryClient.invalidateQueries({ queryKey: [orderQueryKey, orderId] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  const order = query.data ?? null;

  /// The three stages a customer cares about, with the timestamp each was
  /// reached. Cancelled orders drop out of this entirely.
  const steps = useMemo(() => {
    if (!order) return [];

    const reached: Record<string, string | null> = {
      [OrderStatusEnum.Pending]: order.placed_at,
      [OrderStatusEnum.Preparing]: order.accepted_at,
      [OrderStatusEnum.Ready]: order.ready_at,
    };

    const order_ = [
      OrderStatusEnum.Pending,
      OrderStatusEnum.Preparing,
      OrderStatusEnum.Ready,
    ];
    const currentIndex = order_.indexOf(order.status as OrderStatusEnum);

    return order_.map((status, index) => ({
      status,
      at: reached[status],
      done: currentIndex < 0 ? true : index < currentIndex,
      active: index === currentIndex,
    }));
  }, [order]);

  return {
    order,
    steps,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isCancelled: order?.status === OrderStatusEnum.Cancelled,
    isDone: order?.status === OrderStatusEnum.Completed,
  };
};
