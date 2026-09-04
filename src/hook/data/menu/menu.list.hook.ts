import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MenuGroupEnum } from "../../../enums/menu.group.enum";
import { menuQueryKey } from "../../../keys/query.keys";
import type { IMenuSection } from "../../../models/data/menu/menu.response";
import { menuServices } from "../../../services/data/menu/menu.services";
import { useMenuStore } from "../../../store/data/menu/menu.store";

/// The customer menu: four reads stitched into sections, then filtered by the
/// search box. The stitching lives here so the screen only ever renders.
export const useMenuListHook = () => {
  const search = useMenuStore((s) => s.search);
  const setSearch = useMenuStore((s) => s.setSearch);
  const activeGroup = useMenuStore((s) => s.activeGroup);
  const setActiveGroup = useMenuStore((s) => s.setActiveGroup);
  const activeCategorySlug = useMenuStore((s) => s.activeCategorySlug);
  const setActiveCategorySlug = useMenuStore((s) => s.setActiveCategorySlug);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [menuQueryKey],
    queryFn: async () => {
      const [categories, products, addons, categoryAddons] = await Promise.all([
        menuServices.getCategories(),
        menuServices.getProducts(),
        menuServices.getAddons(),
        menuServices.getCategoryAddons(),
      ]);
      return { categories, products, addons, categoryAddons };
    },
  });

  const sections = useMemo<IMenuSection[]>(() => {
    if (!data) return [];

    const addonsById = new Map(data.addons.map((addon) => [addon.id, addon]));

    return data.categories
      .map((category) => ({
        ...category,
        products: data.products
          .filter((product) => product.category_id === category.id)
          .map((product) => ({
            ...product,
            product_sizes: [...product.product_sizes].sort(
              (a, b) => a.sort_order - b.sort_order,
            ),
          }))
          .sort((a, b) => a.sort_order - b.sort_order),
        addons: data.categoryAddons
          .filter((link) => link.category_id === category.id)
          .map((link) => addonsById.get(link.addon_id))
          .filter((addon): addon is NonNullable<typeof addon> => Boolean(addon))
          .sort((a, b) => a.sort_order - b.sort_order),
      }))
      .filter((section) => section.products.length > 0);
  }, [data]);

  /// Only the groups that actually have something on them, in menu order — the
  /// tabs must not offer Food while the food menu is still empty.
  const groups = useMemo(() => {
    const present = new Set(sections.map((section) => section.menu_group));
    return Object.values(MenuGroupEnum).filter((group) => present.has(group));
  }, [sections]);

  /// A stored group the menu no longer has falls back to the first one that
  /// does, so a bookmarked Food tab cannot strand the customer on nothing.
  const currentGroup =
    activeGroup && groups.includes(activeGroup) ? activeGroup : (groups[0] ?? null);

  const groupSections = useMemo(
    () =>
      currentGroup
        ? sections.filter((section) => section.menu_group === currentGroup)
        : sections,
    [sections, currentGroup],
  );

  /// Search narrows the products inside each section and drops sections that
  /// end up empty, so the rail and the body always agree on what exists. It
  /// stays inside the current group — the tabs are what move between menus.
  const visibleSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groupSections;

    return groupSections
      .map((section) => ({
        ...section,
        products: section.products.filter(
          (product) =>
            product.name.toLowerCase().includes(term) ||
            (product.description ?? "").toLowerCase().includes(term),
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [groupSections, search]);

  const resultCount = useMemo(
    () => visibleSections.reduce((total, section) => total + section.products.length, 0),
    [visibleSections],
  );

  return {
    sections: visibleSections,
    /// Every section regardless of group — the cart resolves a line's options
    /// through this, and a line can outlive a tab switch.
    allSections: sections,
    groups,
    activeGroup: currentGroup,
    setActiveGroup,
    resultCount,
    search,
    setSearch,
    activeCategorySlug,
    setActiveCategorySlug,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
};
