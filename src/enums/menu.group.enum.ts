/// The fixed top level of the menu. Categories (Coffee, Matcha, Pastries…) are
/// admin-managed and hang off one of these; adding a third group is a migration
/// on the `menu_group` type, not a row.
export enum MenuGroupEnum {
  Drinks = "drinks",
  Food = "food",
}

export const menuGroupLabels: Record<MenuGroupEnum, string> = {
  [MenuGroupEnum.Drinks]: "Drinks",
  [MenuGroupEnum.Food]: "Food",
};

/// A drink is priced per size — 12oz, 16oz. Food is priced per type: "1pc",
/// "3pcs set". Same masterfile and the same `product_sizes` rows behind both;
/// only the word in front of the shop changes, so the item form asks for the
/// one that matches the menu the item is filed under.
export const menuPortionNoun: Record<MenuGroupEnum, { one: string; many: string }> = {
  [MenuGroupEnum.Drinks]: { one: "size", many: "Sizes" },
  [MenuGroupEnum.Food]: { one: "type", many: "Types" },
};

export const menuGroupOptions = Object.values(MenuGroupEnum).map((value) => ({
  value,
  label: menuGroupLabels[value],
}));
