import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useEffect } from "react";
import {
  messageThreadsQueryKey,
  orderMessagesQueryKey,
} from "../../../keys/query.keys";
import { messageServices } from "../../../services/data/order/message.services";
import { useSessionStore } from "../../../store/common/session.store";
import { supabaseError } from "../../../utils/supabase.utils";

/// Staff reading and answering one thread.
///
/// No subscription here either: AdminLayout holds the single realtime channel
/// and invalidates this key from there, so opening five drawers in a shift
/// still costs one socket.
export const useAdminOrderChatHook = (orderId: string | undefined, open: boolean) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const staffId = useSessionStore((s) => s.profile?.id);

  const query = useQuery({
    queryKey: [orderMessagesQueryKey, orderId],
    queryFn: () => messageServices.getStaffMessages(orderId as string),
    enabled: Boolean(orderId) && open,
    staleTime: 0,
  });

  // Opening the thread is reading it. Fire-and-forget: a failed mark-read
  // leaves a badge up, which is a great deal better than blocking the drawer.
  useEffect(() => {
    if (!orderId || !open) return;

    void messageServices
      .markThreadRead(orderId)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: [messageThreadsQueryKey] }),
      )
      .catch(() => undefined);
  }, [orderId, open, query.data, queryClient]);

  const mutation = useMutation({
    mutationFn: (body: string) =>
      messageServices.sendStaffMessage(orderId as string, staffId as string, body),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [orderMessagesQueryKey, orderId],
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
    isLoading: query.isLoading,
    isSending: mutation.isPending,
    /// The insert policy requires sender='staff' AND staff_id = auth.uid(), so
    /// without a loaded profile the database would refuse it anyway.
    canSend: Boolean(staffId),
    send: (body: string) => mutation.mutateAsync(body),
  };
};
