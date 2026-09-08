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
  IProductRow,
  ISize,
} from "../../../models/data/menu/menu.response";
import type { IStaffProfile } from "../../../store/common/session.store";
import { emailConfirmUrl } from "../../../constants/auth.constants";
import { menuImageBucket } from "../../../constants/image.constants";
import { supabase } from "../../../utils/supabase.utils";
import { withMenuImageUrl } from "../../../utils/storage.utils";

export const adminServices = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /// Creates the auth user only. The matching profile row — pending, with no
  /// access to anything — is written by the on_auth_user_created trigger.
  ///
  /// `emailRedirectTo` is what the stock Supabase template follows. Our own
  /// template ignores it and links to the same page with a token instead, so
  /// either template lands the visitor on the confirmation screen.
  signUp: async (fullName: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: emailConfirmUrl() },
    });

    if (error) throw error;
    return data;
  },

  /// Another copy of the sign-up email, for the address that never got the
  /// first one. Only ever sends to an address that is already registered and
  /// still unconfirmed — Supabase decides that, not us.
  resendSignUpEmail: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: emailConfirmUrl() },
    });

    if (error) throw error;
  },

  /// Redeems the single-use token from the email link. Success confirms the
  /// address and opens a session; the profile behind it is still pending, so
  /// the caller signs straight back out.
  verifySignUpEmail: async (tokenHash: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "signup",
    });

    if (error) throw error;
    return data;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
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

  /// Hard delete. 0010 makes products.category_id RESTRICT, so a category with
  /// items on it is refused by the database rather than quietly taking them
  /// with it — the caller checks the count first and says so in plainer words.
  deleteCategory: async (categoryId: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) throw error;
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

  /// Hard delete. RESTRICT (0010) stops a size that products are priced
  /// against from being removed out from under them.
  deleteSize: async (sizeId: string) => {
    const { error } = await supabase.from("sizes").delete().eq("id", sizeId);
    if (error) throw error;
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
    return ((data ?? []) as IProductRow[]).map(withMenuImageUrl);
  },

  // ---------------------------------------------------------- product image

  /// Uploads under a fresh random name and hands back the path the row stores.
  /// Nothing is ever overwritten in place: a re-shot drink gets a new path, so
  /// a CDN copy of the old file can never be served against the new one.
  uploadProductImage: async (file: Blob): Promise<string> => {
    const path = `products/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage.from(menuImageBucket).upload(path, file, {
      contentType: file.type,
      // Immutable by construction — the name changes whenever the bytes do.
      cacheControl: "31536000",
    });

    if (error) throw error;
    return path;
  },

  deleteProductImage: async (path: string) => {
    const { error } = await supabase.storage.from(menuImageBucket).remove([path]);
    if (error) throw error;
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
      image_path: request.image_path,
      sort_order: request.sort_order,
      is_active: request.is_active,
    };

    const { data, error } = id
      ? await supabase.from("products").update(fields).eq("id", id).select().single()
      : await supabase.from("products").insert(fields).select().single();

    if (error) throw error;
    const saved = withMenuImageUrl(data as IProductRow);

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
        serve_temperature: size.serve_temperature,
        sort_order: index + 1,
        is_active: size.is_active ?? true,
      })),
    );
    if (sizeError) throw sizeError;

    return saved;
  },

  /// Hard delete. Sizes cascade with it; order_items keeps its own copy of the
  /// name, size and price and only loses the link (0001), so a receipt already
  /// handed over still reads correctly.
  ///
  /// The photo goes only once the row is gone: removed first, a failed delete
  /// would leave a live product pointing at a file that no longer exists.
  deleteProduct: async (product: Pick<IProduct, "id" | "image_path">) => {
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) throw error;

    if (!product.image_path) return;
    // Best effort: the item is already gone, and reporting a failure here would
    // tell the user the delete did not happen when it did.
    await supabase.storage
      .from(menuImageBucket)
      .remove([product.image_path])
      .catch(() => undefined);
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

  /// Hard delete. The category links cascade; an add-on already on a receipt
  /// was denormalised into order_items.addons as json, so history is unaffected.
  deleteAddon: async (addonId: string) => {
    const { error } = await supabase.from("addons").delete().eq("id", addonId);
    if (error) throw error;
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
