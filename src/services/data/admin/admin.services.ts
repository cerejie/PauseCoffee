import type {
  IAddonRequest,
  ICategoryRequest,
  IProductRequest,
  ISizeRequest,
} from "../../../models/data/menu/menu.request";
import type {
  IAddon,
  ICategory,
  ICategoryAddon,
  IProduct,
  ISize,
} from "../../../models/data/menu/menu.response";
import type { IStaffProfile } from "../../../store/common/session.store";
import { supabase } from "../../../utils/supabase.utils";

export const adminServices = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /// Creates the auth user only. The matching profile row — pending, with no
  /// access to anything — is written by the on_auth_user_created trigger.
  signUp: async (fullName: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /// An approved profile row is what authorises the admin app — an auth user
  /// without one, or with one still pending, is signed in but has no access, so
  /// the guard checks this, not the session.
  getProfile: async (userId: string): Promise<IStaffProfile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, status")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return (data as IStaffProfile | null) ?? null;
  },

  // ------------------------------------------------------------- categories

  getCategories: async (): Promise<ICategory[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as ICategory[];
  },

  saveCategory: async (request: ICategoryRequest): Promise<ICategory> => {
    const { id, ...fields } = request;
    const query = id
      ? supabase.from("categories").update(fields).eq("id", id)
      : supabase.from("categories").insert(fields);

    const { data, error } = await query.select().single();
    if (error) throw error;
    return data as ICategory;
  },

  setCategoryActive: async (categoryId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: isActive })
      .eq("id", categoryId);

    if (error) throw error;
  },

  // ------------------------------------------------------------------ sizes

  getSizes: async (): Promise<ISize[]> => {
    const { data, error } = await supabase
      .from("sizes")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as ISize[];
  },

  saveSize: async (request: ISizeRequest): Promise<ISize> => {
    const { id, ...fields } = request;
    const query = id
      ? supabase.from("sizes").update(fields).eq("id", id)
      : supabase.from("sizes").insert(fields);

    const { data, error } = await query.select().single();
    if (error) throw error;
    return data as ISize;
  },

  // --------------------------------------------------------------- products

  getProducts: async (): Promise<IProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_sizes(*)")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as IProduct[];
  },

  /// Sizes are replaced wholesale rather than diffed: a product has two or
  /// three of them, and delete-then-insert keeps the write one obvious shape.
  saveProduct: async (request: IProductRequest): Promise<IProduct> => {
    const { id, sizes } = request;
    // Listed column by column rather than spread: the form also carries a
    // `menu_group`, which narrows the category picker and is not a column here.
    const fields = {
      category_id: request.category_id,
      name: request.name,
      description: request.description ?? null,
      badge: request.badge ?? null,
      sort_order: request.sort_order,
      is_active: request.is_active,
    };

    const { data, error } = id
      ? await supabase.from("products").update(fields).eq("id", id).select().single()
      : await supabase.from("products").insert(fields).select().single();

    if (error) throw error;
    const saved = data as IProduct;

    const keepIds = sizes.map((size) => size.id).filter(Boolean) as string[];
    let deleteQuery = supabase.from("product_sizes").delete().eq("product_id", saved.id);
    if (keepIds.length) deleteQuery = deleteQuery.not("id", "in", `(${keepIds.join(",")})`);

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    const { error: sizeError } = await supabase.from("product_sizes").upsert(
      sizes.map((size, index) => ({
        ...(size.id ? { id: size.id } : {}),
        product_id: saved.id,
        size_id: size.size_id,
        label: size.label,
        price: size.price,
        sort_order: index + 1,
        is_active: size.is_active ?? true,
      })),
    );
    if (sizeError) throw sizeError;

    return saved;
  },

  setProductActive: async (productId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive })
      .eq("id", productId);

    if (error) throw error;
  },

  // ----------------------------------------------------------------- addons

  getAddons: async (): Promise<IAddon[]> => {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as IAddon[];
  },

  saveAddon: async (request: IAddonRequest): Promise<IAddon> => {
    const { id, category_ids: categoryIds, ...fields } = request;
    const query = id
      ? supabase.from("addons").update(fields).eq("id", id)
      : supabase.from("addons").insert(fields);

    const { data, error } = await query.select().single();
    if (error) throw error;

    const saved = data as IAddon;
    await adminServices.saveAddonCategories(saved.id, categoryIds);
    return saved;
  },

  // --------------------------------------------------------- category links

  /// Every link row, for both the add-on form's multi-select and the column
  /// that shows which categories offer a given add-on.
  getCategoryAddons: async (): Promise<ICategoryAddon[]> => {
    const { data, error } = await supabase.from("category_addons").select("*");

    if (error) throw error;
    return (data ?? []) as ICategoryAddon[];
  },

  /// Replace-all rather than a diff: an add-on is offered by a handful of
  /// categories, and one clear write beats reconciling two sets.
  saveAddonCategories: async (addonId: string, categoryIds: string[]) => {
    let deleteQuery = supabase.from("category_addons").delete().eq("addon_id", addonId);
    if (categoryIds.length) {
      deleteQuery = deleteQuery.not("category_id", "in", `(${categoryIds.join(",")})`);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    if (!categoryIds.length) return;

    const { error } = await supabase
      .from("category_addons")
      .upsert(
        categoryIds.map((categoryId) => ({ addon_id: addonId, category_id: categoryId })),
        { onConflict: "category_id,addon_id" },
      );

    if (error) throw error;
  },
};
