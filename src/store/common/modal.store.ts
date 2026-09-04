import type { IModalRequest } from "../../models/common/modal.model";
import { create } from "./reset.store";

type States = {
  modals: Record<string, IModalRequest<unknown>>;
};

type Actions = {
  setModal: <T>(key: string, value: IModalRequest<T>) => void;
  resetModal: (key: string) => void;
  removeModal: (key: string) => void;
};

/// One store, a key per caller — the registry pattern the whole app uses for
/// shared screen state instead of a store per modal.
export const useModalStore = create<States & Actions>((set) => ({
  modals: {},
  setModal: (key, value) =>
    set((state) => ({
      modals: { ...state.modals, [key]: value as IModalRequest<unknown> },
    })),
  resetModal: (key) =>
    set((state) => ({
      modals: { ...state.modals, [key]: { visible: false } },
    })),
  removeModal: (key) =>
    set((state) => {
      const next = { ...state.modals };
      delete next[key];
      return { modals: next };
    }),
}));
