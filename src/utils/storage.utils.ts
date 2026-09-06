import { menuImageBucket } from "../constants/image.constants";
import type { IProduct, IProductRow } from "../models/data/menu/menu.response";
import { supabase } from "./supabase.utils";

/// Rows store the object path; the CDN URL is derived on read. Keeping the
/// project ref out of the data is what lets the same rows be restored into
/// another project, or moved behind signed URLs later, without a migration.
export const menuImageUrl = (path: string | null | undefined): string | null =>
  path ? supabase.storage.from(menuImageBucket).getPublicUrl(path).data.publicUrl : null;

/// Every reader of a product wants the URL, none of them want the path, so the
/// two services resolve it once on the way out rather than in each component.
export const withMenuImageUrl = (row: IProductRow): IProduct => ({
  ...row,
  image_url: menuImageUrl(row.image_path),
});
