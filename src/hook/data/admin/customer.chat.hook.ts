import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useEffect, useMemo } from "react";
import {
  customerMessagesQueryKey,
  messageThreadsQueryKey,
} from "../../../keys/query.keys";
import type {
  ICustomerThread,
  IStaffOrderMessage,
} from "../../../models/data/order/message.response";
import { messageServices } from "../../../services/data/order/message.services";
import { useSessionStore } from "../../../store/common/session.store";
import { supabaseError } from "../../../utils/supabase.utils";

/// Staff reading and answering one customer.
///
/// The unit is the person, not the ticket: every order they have messaged
/// about is read as one conversation, and a reply goes to whichever of those
/// orders is still open. Somebody who ordered twice this week is one person to
/// answer, and splitting them across two threads loses the half of the context
/// that makes the answer right.
///
/// No subscription here: AdminLayout holds the single realtime channel and
/// invalidates this key from there, so opening five conversations in a shift
/// still costs one socket.
export const useCustomerChatHook = (thread: ICustomerThread | null) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const staffId = useSessionStore((s) => s.profile?.id);

  const customerKey = thread?.customer_key;
  const orderIds = useMemo(() => thread?.order_ids ?? [], [thread?.order_ids]);

  const query = useQuery({
    queryKey: [customerMessagesQueryKey, customerKey],
    queryFn: () => messageServices.getStaffMessages(orderIds),
    enabled: Boolean(customerKey),
    staleTime: 0,
  });

  // Opening the conversation is reading it — all of it, because the badge
  // counts the person rather than the order. Fire-and-forget: a failed
  // mark-read leaves a badge up, which is a great deal better than blocking
  // the screen.
  useEffect(() => {
    if (!customerKey || orderIds.length === 0) return;

    void messageServices
      .markThreadRead(orderIds)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: [messageThreadsQueryKey] }),
      )
      .catch(() => undefined);
  }, [customerKey, orderIds, query.data, queryClient]);

  /// The rule above each run of messages, saying which order it belongs to.
  /// Drawn only when there is more than one — a single order has nothing to be
  /// separated from.
  const sections = useMemo(() => {
    const labels = new Map<string, string>();
    if (!thread || thread.orders.length < 2) return labels;

    const numbers = new Map(
      thread.orders.map((order) => [order.order_id, order.order_number]),
    );
    let current: string | null = null;

    (query.data ?? []).forEach((entry: IStaffOrderMessage) => {
      if (entry.order_id === current) return;
      current = entry.order_id;
      labels.set(entry.id, `Order ${numbers.get(entry.order_id) ?? ""}`.trim());
    });

    return labels;
  }, [thread, query.data]);

  const replyOrderId = thread?.reply_order_id ?? null;

  const mutation = useMutation({
    mutationFn: (body: string) =>
      messageServices.sendStaffMessage(
        replyOrderId as string,
        staffId as string,
        body,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [customerMessagesQueryKey, customerKey],
      });
      void queryClient.invalidateQueries({ queryKey: [messageThreadsQueryKey] });
    },

    onError: (error) => {
      notification.error({
        message: "That didn't send",
        description: supabaseError(error),
      });
    },
  });

  return {
    messages: query.data ?? [],
    sections,
    isLoading: query.isLoading,
    isSending: mutation.isPending,
    /// The insert policy requires sender='staff' AND staff_id = auth.uid() AND
    /// an open thread, so without a loaded profile or an open order the
    /// database would refuse this anyway.
    canSend: Boolean(staffId) && Boolean(replyOrderId),
    /// Which order the reply will be filed against — worth saying out loud
    /// when the customer has more than one.
    replyOrderNumber: thread?.reply_order_number ?? null,
    send: (body: string) => mutation.mutateAsync(body),
  };
};
