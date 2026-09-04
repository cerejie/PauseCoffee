import type { IPaginationRequest } from "../../models/common/pagination.model";
import { IPaginationRequestFormValues } from "../../models/common/pagination.model";
import { create } from "./reset.store";

type States = {
  paginations: Record<string, IPaginationRequest>;
};

type Actions = {
  setPagination: (key: string, value: IPaginationRequest) => void;
  resetPagination: (key: string, defaults?: IPaginationRequest) => void;
};

export const usePaginationStore = create<States & Actions>((set) => ({
  paginations: {},
  setPagination: (key, value) =>
    set((state) => ({ paginations: { ...state.paginations, [key]: value } })),
  resetPagination: (key, defaults) =>
    set((state) => ({
      paginations: {
        ...state.paginations,
        [key]: defaults ?? new IPaginationRequestFormValues(),
      },
    })),
}));
