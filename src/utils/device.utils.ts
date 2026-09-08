import { deviceStorageKey } from "../keys/storage.keys";

/// This browser's name for itself.
///
/// A conversation has to survive a refresh, and the only thing that persists on
/// a guest's phone is storage they own. So the app mints one uuid, keeps it,
/// and sends it with every order; the server hands back the thread that
/// belongs to it. There is no MAC address to read here and no way to get one —
/// nothing on the web platform exposes hardware identity, by design.
///
/// The id is a capability, exactly as an order's uuid already is: whoever holds
/// it can read that conversation, and it is never rendered, logged or put in a
/// URL. It buys no access to anything else — orders, prices and staff replies
/// all stay behind their own rules.

let cached: string | null = null;

const mint = (): string => {
  // Available in every browser this PWA installs on; the fallback is for the
  // insecure-origin case, where randomUUID is not exposed but getRandomValues
  // still is. Read as a value rather than narrowed in an `if`, so the fallback
  // branch keeps a `crypto` to call.
  const native = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : null;
  if (native) return native;

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // RFC 4122 version and variant bits, so the value is a uuid the database will
  // accept rather than 32 random hex characters that look like one.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/// Read once, minted on first use. Private mode or blocked storage falls back
/// to an id that lasts the session: the conversation still works while the tab
/// is open, it just cannot outlive it — which is the most the browser allows.
export const getDeviceId = (): string => {
  if (cached) return cached;

  try {
    const stored = localStorage.getItem(deviceStorageKey);
    if (stored) {
      cached = stored;
      return stored;
    }

    const minted = mint();
    localStorage.setItem(deviceStorageKey, minted);
    cached = minted;
    return minted;
  } catch {
    cached = mint();
    return cached;
  }
};
