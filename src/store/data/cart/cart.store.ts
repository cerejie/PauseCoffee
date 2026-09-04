import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartStorageKey } from "../../../keys/storage.keys";
import type { ICartLine } from "../../../models/data/order/cart.model";

type States = {
  lines: ICartLine[];
};

type Actions = {
  addLine: (line: Omit<ICartLine, "key">) => void;
  replaceLine: (key: string, line: Omit<ICartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
};

/// Two configurations of the same drink are the same line only when every
/// option matches — that identity is what lets a re-add bump the quantity
/// instead of stacking a duplicate row.
export const cartLineKey = (line: Omit<ICartLine, "key" | "quantity">): string =>
  [
    line.sizeId,
    line.temperature ?? "-",
    line.sweetness ?? "-",
    [...line.addons.map((a) => a.id)].sort().join("."),
    (line.notes ?? "").trim().toLowerCase(),
  ].join("|");

/// Deliberately outside the reset.store wrapper: an admin signing out must not
/// wipe a customer's cart on a shared counter tablet.
export const useCartStore = create<States & Actions>()(
  persist(
    (set) => ({
      lines: [],

      addLine: (line) =>
        set((state) => {
          const key = cartLineKey(line);
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key
                  ? { ...l, quantity: Math.min(50, l.quantity + line.quantity) }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, key }] };
        }),

      // Editing a line can collapse it onto an existing one (drop the add-on
      // that made it distinct), so the merge is handled here too.
      replaceLine: (key, line) =>
        set((state) => {
          const nextKey = cartLineKey(line);
          const withoutOriginal = state.lines.filter((l) => l.key !== key);
          const collision = withoutOriginal.find((l) => l.key === nextKey);

          if (collision) {
            return {
              lines: withoutOriginal.map((l) =>
                l.key === nextKey
                  ? { ...l, quantity: Math.min(50, l.quantity + line.quantity) }
                  : l,
              ),
            };
          }

          const index = state.lines.findIndex((l) => l.key === key);
          const next = [...withoutOriginal];
          next.splice(index < 0 ? next.length : index, 0, { ...line, key: nextKey });
          return { lines: next };
        }),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity < 1
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) =>
                  l.key === key ? { ...l, quantity: Math.min(50, quantity) } : l,
                ),
        })),

      removeLine: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      clearCart: () => set({ lines: [] }),
    }),
    {
      name: cartStorageKey,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
