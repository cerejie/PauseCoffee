import type { MenuGroupEnum } from "../../../enums/menu.group.enum";

export interface ICategoryRequest {
  id?: string;
  slug: string;
  menu_group: MenuGroupEnum;
  name: string;
  tagline?: string | null;
  accent_color: string;
  has_temperature: boolean;
  has_sweetness: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface IProductSizeRequest {
  id?: string;
  /// Picked from the sizes masterfile; the label is copied from that row at
  /// save time so the receipt text is fixed at the moment of pricing.
  size_id: string;
  label: string;
  price: number;
  sort_order: number;
  is_active?: boolean;
}

export interface IProductRequest {
  id?: string;
  /// Not a column — it only narrows the category picker in the form.
  menu_group?: MenuGroupEnum;
  category_id: string;
  name: string;
  description?: string | null;
  badge?: string | null;
  sort_order: number;
  is_active: boolean;
  sizes: IProductSizeRequest[];
}

export interface IAddonRequest {
  id?: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
  /// Which categories offer this add-on. Written to `category_addons` as a
  /// replace-all, so an empty list means "offered by nothing".
  category_ids: string[];
}

export interface ISizeRequest {
  id?: string;
  name: string;
  menu_group: MenuGroupEnum | null;
  sort_order: number;
  is_active: boolean;
}
