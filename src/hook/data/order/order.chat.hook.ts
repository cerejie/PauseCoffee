import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useEffect, useMemo } from "react";
import { deviceMessagesQueryKey } from "../../../keys/query.keys";
import type { IDeviceMessage } from "../../../models/data/order/message.response";
import { messageServices } from "../../../services/data/order/message.services";
import { getDeviceId } from "../../../utils/device.utils";
import { supabaseError } from "../../../utils/supabase.utils";

/// The customer's side of the conversation.
///
/// Keyed on the device rather than on the order the tracker happens to be
/// showing. A refresh, a second order, or coming back tomorrow to a link that
/// names a different ticket all land on the same thread — which is what a
/// customer means by "my messages with the shop". The server still decides how
/// long that is: get_device_messages returns only orders inside their retention
/// window, so the thread empties itself on the same clock that deletes it.
///
/// There is no subscription here on purpose. The tracker already holds the
/// `order:<id>` broadcast channel through useOrderStatusHook, and the message
/// trigger publishes to that same topic — so the listener lives there and this
/// hook only reads and writes. A reply on an older order arrives on the poll
/// instead, which is the one case the open channel cannot cover.
export const useOrderChatHook = (orderId: string | undefined, open: boolean) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const deviceId = getDeviceId();

  // The order on screen joins this device's conversation the first time the
  // thread opens on it. Fire-and-forget: a refusal means somebody else's
  // device already owns the order, and the right answer to that is to show
  // this device only what is genuinely its own.
  useEffect(() => {
    if (!orderId || !open) return;

    void messageServices
      .claimOrder(orderId, deviceId)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: [deviceMessagesQueryKey, deviceId],
        }),
      )
      .catch(() => undefined);
  }, [orderId, open, deviceId, queryClient]);

  const query = useQuery({
    queryKey: [deviceMessagesQueryKey, deviceId],
    queryFn: () => messageServices.getDeviceMessages(deviceId),
    enabled: open,
    staleTime: 0,
    // The broadcast does the work; this only covers a dropped socket, and a
    // reply written against an order the tracker is not currently showing.
    refetchInterval: open ? 60_000 : false,
  });

  /// Where one order's conversation ends and the next begins, keyed by the
  /// message that starts each run. Computed here because this is the layer
  /// that knows which order a message belongs to; ChatThread only draws it.
  ///
  /// Reads query.data rather than a `?? []` fallback: that fallback is a fresh
  /// array on every render, so it would invalidate this memo every time.
  const sections = useMemo(() => {
    const labels = new Map<string, string>();
    let current: string | null = null;

    (query.data ?? []).forEach((entry: IDeviceMessage) => {
      if (entry.order_id === current) return;
      current = entry.order_id;
      labels.set(entry.id, `Order ${entry.order_number}`);
    });

    // A single order needs no rule above it — there is nothing to separate it
    // from.
    return labels.size > 1 ? labels : new Map<string, string>();
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (body: string) =>
      messageServices.sendDeviceMessage(deviceId, body),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [deviceMessagesQueryKey, deviceId],
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
    sections,
    isLoading: query.isLoading,
    isSending: mutation.isPending,
    /// Rejects on failure so the composer can put the draft back in the box.
    send: (body: string) => mutation.mutateAsync(body),
  };
};
