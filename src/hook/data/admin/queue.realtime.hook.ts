import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { OrderStatusEnum } from "../../../enums/order.enum";
import { orderQueueQueryKey } from "../../../keys/query.keys";
import { orderServices } from "../../../services/data/order/order.services";
import { supabase } from "../../../utils/supabase.utils";

/// A short chime when a new ticket lands. Synthesised rather than shipped as an
/// asset so it works offline and adds nothing to the bundle.
const playChime = () => {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    gain.connect(ctx.destination);

    [880, 1320].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(gain);
      osc.start(ctx.currentTime + index * 0.11);
      osc.stop(ctx.currentTime + 0.6);
    });

    window.setTimeout(() => void ctx.close(), 900);
  } catch {
    // Autoplay policy or no audio device — the visual toast still fires.
  }
};

/// The queue's live wire, mounted once by AdminLayout so the chime and the
/// subscription exist exactly once no matter which admin screen is open.
/// The board itself reads the same query key through useOrderQueueHook.
export const useQueueRealtimeHook = () => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [isLive, setIsLive] = useState(false);

  const query = useQuery({
    queryKey: [orderQueueQueryKey],
    queryFn: () => orderServices.getQueue(),
    staleTime: 0,
    // A silent fallback in case the socket drops without firing an error.
    refetchInterval: 45_000,
  });

  // Only announce tickets that appear after the board is up, otherwise the
  // first load would chime once per waiting order.
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!query.data) return;

    const ids = new Set(query.data.map((ticket) => ticket.id));

    if (seenIds.current === null) {
      seenIds.current = ids;
      return;
    }

    const fresh = query.data.filter(
      (ticket) =>
        !seenIds.current?.has(ticket.id) && ticket.status === OrderStatusEnum.Pending,
    );

    if (fresh.length) {
      playChime();
      fresh.forEach((ticket) =>
        notification.info({
          message: `New order ${ticket.order_number}`,
          description: `${ticket.customer_name} · ${ticket.item_count} item${
            ticket.item_count === 1 ? "" : "s"
          }`,
          placement: "topRight",
          duration: 6,
        }),
      );
    }

    seenIds.current = ids;
  }, [query.data, notification]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-order-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: [orderQueueQueryKey] });
      })
      .subscribe((status) => setIsLive(status === "SUBSCRIBED"));

    return () => {
      setIsLive(false);
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const pendingCount = useMemo(
    () =>
      (query.data ?? []).filter((ticket) => ticket.status === OrderStatusEnum.Pending)
        .length,
    [query.data],
  );

  return { isLive, pendingCount };
};
