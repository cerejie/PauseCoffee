/// The online app answers on a path the shop chooses, so the link it prints on
/// a sign can read the way it wants. The router matches the first segment at
/// runtime against a dynamic route, which is what makes the rules below matter:
/// these are the same two constraints migration 0018 puts on the column, kept
/// here so the admin form can refuse a bad slug before the database has to.

export const defaultOnlineSlug = "order-online";

/// Lowercase kebab. It gets typed off a printed sign and read aloud over a
/// counter, so nothing exotic survives here.
export const onlineSlugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const onlineSlugMinLength = 3;
export const onlineSlugMaxLength = 40;

/// Every static first segment the app already answers on. React Router ranks a
/// literal segment above a dynamic one, so a slug of "cart" would never match —
/// the customer's link would 404 with nothing on screen to explain why.
export const reservedOnlineSlugs = [
  "admin",
  "cart",
  "order",
  "api",
  "assets",
  "auth",
  "login",
  "static",
  "confirm",
  "sw",
  "manifest",
] as const;

export const isReservedOnlineSlug = (slug: string): boolean =>
  (reservedOnlineSlugs as readonly string[]).includes(slug.trim().toLowerCase());

/// The shareable link, built against whatever host the admin is looking at —
/// so it reads as the vercel.app address in production and as localhost while
/// the shop is being set up, without either being hardcoded.
export const onlineOrderUrl = (slug: string): string =>
  `${window.location.origin}/${slug}`;
