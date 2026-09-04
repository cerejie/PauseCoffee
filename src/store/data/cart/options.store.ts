import type { TemperatureEnum } from "../../../enums/order.enum";
import { create } from "../../common/reset.store";

export interface IOptionsDraft {
  sizeId: string | null;
  temperature: TemperatureEnum | null;
  sweetness: string | null;
  addonIds: string[];
  quantity: number;
  notes: string;
}

type States = {
  draft: IOptionsDraft;
};

type Actions = {
  seedDraft: (draft: IOptionsDraft) => void;
  setSize: (sizeId: string) => void;
  setTemperature: (temperature: TemperatureEnum) => void;
  setSweetness: (sweetness: string) => void;
  toggleAddon: (addonId: string) => void;
  setQuantity: (quantity: number) => void;
  setNotes: (notes: string) => void;
};

export const emptyDraft: IOptionsDraft = {
  sizeId: null,
  temperature: null,
  sweetness: null,
  addonIds: [],
  quantity: 1,
  notes: "",
};

/// The options drawer's working copy. It lives in a store rather than the
/// drawer's own state because the body and the sticky footer are separate
/// components and both need the running selection.
export const useOptionsStore = create<States & Actions>((set) => ({
  draft: emptyDraft,

  seedDraft: (draft) => set({ draft }),
  setSize: (sizeId) => set((s) => ({ draft: { ...s.draft, sizeId } })),
  setTemperature: (temperature) => set((s) => ({ draft: { ...s.draft, temperature } })),
  setSweetness: (sweetness) => set((s) => ({ draft: { ...s.draft, sweetness } })),

  toggleAddon: (addonId) =>
    set((s) => ({
      draft: {
        ...s.draft,
        addonIds: s.draft.addonIds.includes(addonId)
          ? s.draft.addonIds.filter((id) => id !== addonId)
          : [...s.draft.addonIds, addonId],
      },
    })),

  setQuantity: (quantity) =>
    set((s) => ({
      draft: { ...s.draft, quantity: Math.min(50, Math.max(1, quantity)) },
    })),

  setNotes: (notes) => set((s) => ({ draft: { ...s.draft, notes } })),
}));
