import { supabase } from "../../../utils/supabase.utils";
import { withMenuImageUrl } from "../../../utils/storage.utils";
import type {
  IAddon,
  ICategory,
  ICategoryAddon,
  IProduct,
  IProductRow,
} from "../../../models/data/menu/menu.response";

/// Supabase calls only — no shaping beyond unwrapping the error envelope.
export const menuServices = {
  /// The customer menu, in one round trip. RLS already filters to active rows.
  getCategories: async (): Promise<ICategory[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as ICategory[];
  },

  getProducts: async (): Promise<IProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_sizes(*)")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return ((data ?? []) as IProductRow[]).map(withMenuImageUrl);
  },

  getAddons: async (): Promise<IAddon[]> => {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as IAddon[];
  },

  /// Which add-ons each category offers — coffee gets syrups, matcha gets the
  /// cold whisk. Returned as raw join rows; the hook stitches them.
  getCategoryAddons: async (): Promise<ICategoryAddon[]> => {
    const { data, error } = await supabase.from("category_addons").select("*");

    if (error) throw error;
    return (data ?? []) as ICategoryAddon[];
  },
};
