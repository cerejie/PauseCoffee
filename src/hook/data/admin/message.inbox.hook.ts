import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { messageThreadsQueryKey } from "../../../keys/query.keys";
import { messageServices } from "../../../services/data/order/message.services";

/// Every conversation, newest first, aggregated by the order_message_threads
/// view so this is one round trip however many are open.
///
/// The inbox is what makes the feature reliable rather than merely present: a
/// message on an order the barista finished an hour ago has nowhere else to
/// show up, and would otherwise simply be missed.
export const useMessageInboxHook = () => {
  const query = useQuery({
    queryKey: [messageThreadsQueryKey],
    queryFn: () => messageServices.getThreads(),
    staleTime: 0,
    // Backstop for a dropped socket; the admin channel does the real work.
    refetchInterval: 60_000,
  });

  // Both memos read query.data rather than a `?? []` fallback: that fallback is
  // a fresh array on every render, so it would invalidate them every time and
  // re-sort the whole inbox for nothing.
  const unreadTotal = useMemo(
    () =>
      (query.data ?? []).reduce(
        (sum, thread) => sum + Number(thread.unread_count ?? 0),
        0,
      ),
    [query.data],
  );

  /// Unanswered conversations float to the top; the rest stay in recency order.
  /// A customer waiting on a reply outranks one who has already had it.
  const ordered = useMemo(
    () =>
      [...(query.data ?? [])].sort((a, b) => {
        const aUnread = Number(a.unread_count ?? 0) > 0 ? 1 : 0;
        const bUnread = Number(b.unread_count ?? 0) > 0 ? 1 : 0;
        if (aUnread !== bUnread) return bUnread - aUnread;
        return b.last_message_at.localeCompare(a.last_message_at);
      }),
    [query.data],
  );

  return {
    threads: ordered,
    unreadTotal,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
