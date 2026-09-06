/// Menu photography lives in one public Supabase bucket. These are the client
/// half of the contract — the bucket enforces its own size and mime limits in
/// migration 0009, so nothing here is the only thing standing between an anon
/// key and a 40MB upload.
export const menuImageBucket = "menu-images";

export const menuImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const menuImageAccept = menuImageMimeTypes.join(",");

/// The raw file, before the browser downscales it. Anything a phone camera
/// produces fits comfortably; a full-resolution export does not, and the
/// barista should be told that at the file picker rather than by the bucket.
export const menuImageMaxBytes = 12 * 1024 * 1024;

/// A card thumbnail is 86px and the drawer hero about 460px wide, so 800px
/// serves both on a 2x screen. Supabase image transformations are a paid
/// feature, which is why the resize happens in the browser before the upload.
export const menuImageMaxEdge = 800;
export const menuImageQuality = 0.82;
