import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useCallback, useMemo } from "react";
import {
  OrderStatusEnum,
  nextOrderStatus,
  queueStatuses,
} from "../../../enums/order.enum";
import { orderQueueQueryKey } from "../../../keys/query.keys";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import { orderServices } from "../../../services/data/order/order.services";
import { useOrderStore } from "../../../store/data/order/order.store";
import { supabaseError } from "../../../utils/supabase.utils";

/// The board's read + write side. It shares the queue's query key with
/// useQueueRealtimeHook (mounted by AdminLayout), so there is one fetch and one
/// subscription no matter how many screens are open.
export const useOrderQueueHook = () => {
  const queryClient = useQueryClient();
  const { notification, modal } = App.useApp();
  const search = useOrderStore((s) => s.queueSearch);
  const setSearch = useOrderStore((s) => s.setQueueSearch);

  const query = useQuery({
    queryKey: [orderQueueQueryKey],
    queryFn: () => orderServices.getQueue(),
    staleTime: 0,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      reason,
    }: {
      orderId: string;
      status: OrderStatusEnum;
      reason?: string;
    }) => orderServices.setStatus(orderId, status, reason),

    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: [orderQueueQueryKey] });
      notification.success({
        message: `${order.order_number} moved to ${order.status}`,
        placement: "bottomRight",
        duration: 2.5,
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't update that ticket",
        description: supabaseError(error),
      });
    },
  });

  const tickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = query.data ?? [];
    if (!term) return rows;

    return rows.filter(
      (ticket) =>
        ticket.order_number.toLowerCase().includes(term) ||
        ticket.customer_name.toLowerCase().includes(term),
    );
  }, [query.data, search]);

  const columns = useMemo(
    () =>
      queueStatuses.map((status) => ({
        status,
        tickets: tickets.filter((ticket) => ticket.status === status),
      })),
    [tickets],
  );

  const advance = useCallback(
    (ticket: IOrderTicket) => {
      const next = nextOrderStatus[ticket.status];
      if (!next) return;
      statusMutation.mutate({ orderId: ticket.id, status: next });
    },
    [statusMutation],
  );

  const cancel = useCallback(
    (ticket: IOrderTicket) => {
      modal.confirm({
        title: `Cancel ${ticket.order_number}?`,
        content: `${ticket.customer_name}'s order will be removed from the board.`,
        okText: "Cancel order",
        okButtonProps: { danger: true },
        cancelText: "Keep it",
        centered: true,
        onOk: () =>
          statusMutation.mutateAsync({
            orderId: ticket.id,
            status: OrderStatusEnum.Cancelled,
          }),
      });
    },
    [modal, statusMutation],
  );

  /// Board-wide numbers for the stat row above the columns.
  const stats = useMemo(() => {
    const rows = query.data ?? [];
    const waiting = rows.filter((t) => t.status === OrderStatusEnum.Pending);
    const brewing = rows.filter((t) => t.status === OrderStatusEnum.Preparing);
    const ready = rows.filter((t) => t.status === OrderStatusEnum.Ready);

    return {
      waiting: waiting.length,
      brewing: brewing.length,
      ready: ready.length,
      cups: rows.reduce((sum, ticket) => sum + ticket.item_count, 0),
    };
  }, [query.data]);

  return {
    columns,
    stats,
    search,
    setSearch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    advance,
    cancel,
    isUpdating: statusMutation.isPending,
  };
};
