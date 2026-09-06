/// The single home for raw brand values. Nothing else in the app may write a
/// hex code: components read the vanilla-extract vars in styles/common/vars.css,
/// which are assigned from here (and from the live antd token) by useBrandVars.
export const brand = {
  /// Warm amber from the Pause roundel.
  primary: "#E9A13B",
  primaryDeep: "#C9821F",
  primarySoft: "#FBEBD2",
  /// Espresso — headings and the admin shell.
  espresso: "#3B2317",
  espressoSoft: "#6B4A38",
  /// Cream canvas the printed menus sit on.
  canvas: "#FBF6EC",
  canvasDeep: "#F4EADB",
  surface: "#FFFDF8",
  surfaceAlt: "#F7F0E3",
  border: "#E7DAC5",
  borderSoft: "#F0E6D6",
  textHeading: "#33200F",
  textBody: "#5A4636",
  textMuted: "#96836E",
  /// Matcha green from the second menu — the app's secondary accent.
  matcha: "#2F5D3A",
  success: "#3F8F5B",
  warning: "#D98324",
  danger: "#C0442F",
  info: "#3B7EA1",
} as const;

export const brandFonts = {
  display: `"Fraunces", "Playfair Display", Georgia, serif`,
  body: `"Inter", -apple-system, "Segoe UI", Roboto, sans-serif`,
} as const;

/// Status colours for the order lifecycle, reused by the tracker and the queue,
/// and for account access on the Users screen — `pending` reads the same way in
/// both, so it is deliberately one entry.
export const statusPalette: Record<string, { fg: string; bg: string }> = {
  pending: { fg: "#B07515", bg: "#FBEBD2" },
  preparing: { fg: "#3B7EA1", bg: "#E1EFF6" },
  ready: { fg: "#2F7C4B", bg: "#DFF1E4" },
  completed: { fg: "#6B4A38", bg: "#F0E6D6" },
  cancelled: { fg: "#C0442F", bg: "#F8E0DC" },
  approved: { fg: "#2F7C4B", bg: "#DFF1E4" },
  revoked: { fg: "#C0442F", bg: "#F8E0DC" },
};
