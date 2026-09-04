import type { MenuGroupEnum } from "../../../enums/menu.group.enum";
import { create } from "../../common/reset.store";

type States = {
  /// Slug of the section the category rail has scrolled to. Lives here rather
  /// than in the page so the rail, the sections and the search box agree.
  activeCategorySlug: string | null;
  /// Null means "whichever group has something in it" — the menu decides, so a
  /// shop with no food yet never opens on an empty tab.
  activeGroup: MenuGroupEnum | null;
  search: string;
};

type Actions = {
  setActiveCategorySlug: (slug: string | null) => void;
  setActiveGroup: (group: MenuGroupEnum | null) => void;
  setSearch: (search: string) => void;
};

export const useMenuStore = create<States & Actions>((set) => ({
  activeCategorySlug: null,
  activeGroup: null,
  search: "",
  setActiveCategorySlug: (activeCategorySlug) => set({ activeCategorySlug }),
  setActiveGroup: (activeGroup) => set({ activeGroup, activeCategorySlug: null }),
  setSearch: (search) => set({ search }),
}));
