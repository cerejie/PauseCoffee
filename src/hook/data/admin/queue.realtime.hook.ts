import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { OrderStatusEnum } from "../../../enums/order.enum";
import { onlineOrdersQueryKey, orderQueueQueryKey } from "../../../keys/query.keys";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import { orderServices } from "../../../services/data/order/order.services";
import { newOrderChime, onlineOrderChime, playChime } from "../../../utils/chime.utils";
import { supabase } from "../../../utils/supabase.utils";

/// Announces only what arrived after the board came up.
///
/// The first load must not chime once per waiting ticket, so the first set of
/// ids is recorded silently and everything after it is compared against what
/// was already there. Returns the rows that are genuinely new.
const useFreshRows = (rows: IOrderTicket[] | undefined) => {
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<IOrderTicket[]>([]);

  useEffect(() => {
    if (!rows) return;

    const ids = new Set(rows.map((row) => row.id));

    if (seen.current === null) {
      seen.current = ids;
      return;
    }

    const added = rows.filter((row) => !seen.current?.has(row.id));
    seen.current = ids;

    if (added.length) setFresh(added);
  }, [rows]);

  return fresh;
};

/// The admin app's live wire, mounted once by AdminLayout so the chimes and the
/// subscription exist exactly once no matter which screen is open.
///
/// One channel, two query keys. The queue board reads `orderQueueQueryKey`
/// through useOrderQueueHook and the approval inbox reads `onlineOrdersQueryKey`
/// through useOnlineOrdersHook; both are invalidated from the single
/// subscription here. A second channel would mean a double chime and a double
/// toast, which is the whole reason this hook exists.
export const useQueueRealtimeHook = () => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [isLive, setIsLive] = useState(false);

  const queueQuery = useQuery({
    queryKey: [orderQueueQueryKey],
    queryFn: () => orderServices.getQueue(),
    staleTime: 0,
    // A silent fallback in case the socket drops without firing an error.
    refetchInterval: 45_000,
  });

  const onlineQuery = useQuery({
    queryKey: [onlineOrdersQueryKey],
    queryFn: () => orderServices.getOnlineOrders(),
    staleTime: 0,
    refetchInterval: 45_000,
  });

  const freshQueue = useFreshRows(queueQuery.data);
  const freshOnline = useFreshRows(onlineQuery.data);

  // A ticket the barista must start making.
  useEffect(() => {
    const arrivals = freshQueue.filter(
      (ticket) => ticket.status === OrderStatusEnum.Pending,
    );
    if (!arrivals.length) return;

    playChime(newOrderChime);
    arrivals.forEach((ticket) =>
      notification.info({
        message: `New order ${ticket.order_number}`,
        description: `${ticket.customer_name} · ${ticket.item_count} item${
          ticket.item_count === 1 ? "" : "s"
        }`,
        placement: "topRight",
        duration: 6,
      }),
    );
  }, [freshQueue, notification]);

  // A payment somebody has to look at. Different tone, and it stays on screen
  // until dismissed — money is waiting on this one, not a cup.
  useEffect(() => {
    if (!freshOnline.length) return;

    playChime(onlineOrderChime);
    freshOnline.forEach((ticket) =>
      notification.warning({
        message: `Online order ${ticket.order_number} needs approval`,
        description: `${ticket.customer_name} paid for ${ticket.item_count} item${
          ticket.item_count === 1 ? "" : "s"
        }. Check the receipt before it reaches the queue.`,
        placement: "topRight",
        duration: 0,
      }),
    );
  }, [freshOnline, notification]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-order-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: [orderQueueQueryKey] });
        void queryClient.invalidateQueries({ queryKey: [onlineOrdersQueryKey] });
      })
      .subscribe((status) => setIsLive(status === "SUBSCRIBED"));

    return () => {
      setIsLive(false);
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const pendingCount = useMemo(
    () =>
      (queueQuery.data ?? []).filter(
        (ticket) => ticket.status === OrderStatusEnum.Pending,
      ).length,
    [queueQuery.data],
  );

  return {
    isLive,
    pendingCount,
    onlineCount: onlineQuery.data?.length ?? 0,
  };
};
