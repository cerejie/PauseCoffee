import type { MenuGroupEnum } from "../../../enums/menu.group.enum";
import { create } from "../../common/reset.store";

type States = {
  /// Menu masterfile filters. Separate from the customer-facing menu store:
  /// these narrow the admin's table, not the shop's menu.
  productSearch: string;
  productGroup: MenuGroupEnum | null;
  productCategoryId: string | null;
  /// Null is "either"; true and false are the two sides of the On-menu switch.
  productOnMenu: boolean | null;
};

type Actions = {
  setProductSearch: (value: string) => void;
  setProductGroup: (value: MenuGroupEnum | null) => void;
  setProductCategoryId: (value: string | null) => void;
  setProductOnMenu: (value: boolean | null) => void;
};

export const useMasterfileStore = create<States & Actions>((set) => ({
  productSearch: "",
  productGroup: null,
  productCategoryId: null,
  productOnMenu: null,

  setProductSearch: (productSearch) => set({ productSearch }),
  // Narrowing the group strands a category picked from the other one.
  setProductGroup: (productGroup) => set({ productGroup, productCategoryId: null }),
  setProductCategoryId: (productCategoryId) => set({ productCategoryId }),
  setProductOnMenu: (productOnMenu) => set({ productOnMenu }),
}));
