/// Where the link in the sign-up email lands. Three places have to agree on
/// it — the redirect handed to Supabase, the route that renders the landing
/// page, and the email template in `supabase/templates/` — so it is declared
/// once here.
export const emailConfirmPath = "/admin/confirm";

/// Absolute, because Supabase will only accept a full URL, and origin-relative
/// so a preview deploy confirms against itself rather than production.
export const emailConfirmUrl = () => `${window.location.origin}${emailConfirmPath}`;

/// Supabase rate-limits confirmation mail per address. Asking again inside the
/// window fails with a raw 429, so the button is held shut for as long.
export const resendCooldownSeconds = 60;
