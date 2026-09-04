import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.",
  );
}

/// The one client for the whole app. Services import this; components never do.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // The customer side is anonymous — only the admin app signs in, and the
    // session must survive a PWA relaunch from the home screen.
    storageKey: "pause.auth",
  },
  realtime: { params: { eventsPerSecond: 5 } },
});

/// Supabase errors arrive as `{ message, details, hint, code }`. Surfacing the
/// raw object in a notification prints "[object Object]", so unwrap it once here.
export const supabaseError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const shape = error as { message?: string; details?: string; hint?: string };
    return shape.message || shape.details || shape.hint || "Something went wrong.";
  }
  return "Something went wrong.";
};
