import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { orderMessagesQueryKey } from "../../../keys/query.keys";
import { messageServices } from "../../../services/data/order/message.services";
import { supabaseError } from "../../../utils/supabase.utils";

/// The customer's side of the conversation.
///
/// There is no subscription here on purpose. The tracker already holds the
/// `order:<id>` broadcast channel through useOrderStatusHook, and the message
/// trigger publishes to that same topic — so the listener lives there and this
/// hook only reads and writes. A second channel on one topic would be a second
/// invalidation for every message.
export const useOrderChatHook = (orderId: string | undefined, open: boolean) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const query = useQuery({
    queryKey: [orderMessagesQueryKey, orderId],
    queryFn: () => messageServices.getMessages(orderId as string),
    enabled: Boolean(orderId) && open,
    staleTime: 0,
    // The broadcast does the work; this only covers a dropped socket.
    refetchInterval: open ? 60_000 : false,
  });

  const mutation = useMutation({
    mutationFn: (body: string) =>
      messageServices.sendMessage({ orderId: orderId as string, body }),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [orderMessagesQueryKey, orderId],
      });
    },

    onError: (error) => {
      notification.error({
        message: "That didn't send",
        description: supabaseError(error),
        placement: "bottomRight",
      });
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isSending: mutation.isPending,
    /// Rejects on failure so the composer can put the draft back in the box.
    send: (body: string) => mutation.mutateAsync(body),
  };
};
