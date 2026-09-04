import type { MenuGroupEnum } from "../../../enums/menu.group.enum";

export interface IProductSize {
  id: string;
  product_id: string;
  /// The masterfile row this size was picked from. `label` is kept alongside on
  /// purpose: it is what the receipt is stamped with, so renaming a size later
  /// cannot rewrite an order that already went out.
  size_id: string | null;
  label: string;
  price: number;
  sort_order: number;
  is_active: boolean;
}

export interface IProduct {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  product_sizes: IProductSize[];
}

/// A size the admin can pick when pricing a product. `menu_group` null means
/// the size is offered to every group.
export interface ISize {
  id: string;
  name: string;
  menu_group: MenuGroupEnum | null;
  sort_order: number;
  is_active: boolean;
}

export interface IAddon {
  id: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
}

export interface ICategory {
  id: string;
  slug: string;
  menu_group: MenuGroupEnum;
  name: string;
  tagline: string | null;
  accent_color: string;
  has_temperature: boolean;
  has_sweetness: boolean;
  sort_order: number;
  is_active: boolean;
}

/// One category with its products, already sorted — the shape the menu screen
/// renders section by section.
export interface IMenuSection extends ICategory {
  products: IProduct[];
  addons: IAddon[];
}

/// A row of the `category_addons` join — which categories offer which add-on.
export interface ICategoryAddon {
  category_id: string;
  addon_id: string;
}
