import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { OrderStatusEnum } from "../../../enums/order.enum";
import { deviceMessagesQueryKey, orderQueryKey } from "../../../keys/query.keys";
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
      // The chat trigger (0016) publishes to this same topic, so the reply
      // arrives down the channel the tracker already holds. Its payload
      // carries no message body either — the RPC stays the only path to the
      // text — so this is another "read again".
      .on("broadcast", { event: "message" }, () => {
        // The conversation is the device's, not this order's, so the whole
        // thread is re-read rather than one ticket's slice of it.
        void queryClient.invalidateQueries({
          queryKey: [deviceMessagesQueryKey],
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  const order = query.data ?? null;

  /// An online order that nobody has approved yet, and one that was refused.
  /// Both sit outside the three-stage path below and must not be drawn on it.
  const isAwaitingApproval = order?.status === OrderStatusEnum.AwaitingApproval;
  const isRejected = order?.status === OrderStatusEnum.Rejected;
  const isCancelled = order?.status === OrderStatusEnum.Cancelled;
  const isRefused = isRejected || isCancelled;

  /// The three stages a customer cares about, with the timestamp each was
  /// reached. Refused and unapproved orders drop out of this entirely.
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
      // `currentIndex < 0` used to mean one thing — completed, so every stage
      // is behind us. Three statuses now fall outside this list, and an order
      // still waiting on a human must not render as a finished one: somebody
      // who has just paid would be told their drink was ready.
      done:
        isAwaitingApproval || isRefused
          ? false
          : currentIndex < 0
            ? true
            : index < currentIndex,
      active: index === currentIndex,
    }));
  }, [order, isAwaitingApproval, isRefused]);

  return {
    order,
    steps,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isCancelled,
    isRejected,
    isAwaitingApproval,
    /// Either refusal — the tracker treats them the same way, but the words it
    /// shows differ: cancelled happened to a real order, rejected means it was
    /// never accepted in the first place.
    isRefused,
    isDone: order?.status === OrderStatusEnum.Completed,
  };
};
