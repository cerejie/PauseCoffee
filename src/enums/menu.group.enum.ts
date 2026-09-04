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

export const menuGroupOptions = Object.values(MenuGroupEnum).map((value) => ({
  value,
  label: menuGroupLabels[value],
}));
