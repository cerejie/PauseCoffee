import { lastOrderStorageKey } from "../../../keys/storage.keys";
import { create } from "../../common/reset.store";
import { OrderStatusEnum } from "../../../enums/order.enum";

type States = {
  /// The order this device last placed. Persisted separately from the cart so
  /// closing the PWA and reopening it still lands on the live tracker.
  lastOrderId: string | null;
  /// Queue board filters.
  queueSearch: string;
  historySearch: string;
  historyStatus: OrderStatusEnum | null;
};

type Actions = {
  setLastOrderId: (id: string | null) => void;
  setQueueSearch: (value: string) => void;
  setHistorySearch: (value: string) => void;
  setHistoryStatus: (value: OrderStatusEnum | null) => void;
};

const readLastOrderId = (): string | null => {
  try {
    return localStorage.getItem(lastOrderStorageKey);
  } catch {
    // Private mode / storage disabled — the tracker just won't auto-resume.
    return null;
  }
};

export const useOrderStore = create<States & Actions>((set) => ({
  lastOrderId: readLastOrderId(),
  queueSearch: "",
  historySearch: "",
  historyStatus: null,

  setLastOrderId: (lastOrderId) => {
    try {
      if (lastOrderId) localStorage.setItem(lastOrderStorageKey, lastOrderId);
      else localStorage.removeItem(lastOrderStorageKey);
    } catch {
      // Non-fatal: the id stays in memory for this session.
    }
    set({ lastOrderId });
  },

  setQueueSearch: (queueSearch) => set({ queueSearch }),
  setHistorySearch: (historySearch) => set({ historySearch }),
  setHistoryStatus: (historyStatus) => set({ historyStatus }),
}));
