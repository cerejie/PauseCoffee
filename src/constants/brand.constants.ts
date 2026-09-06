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
  /// Reading on espresso. The admin sider, the mobile tab bar, the login panel
  /// and the light wordmark all sit on the dark shell; without a named family
  /// each rule invented its own cream, which is how four of them ended up in
  /// the app doing one job. Alphas are the tiers, not separate hues.
  onEspresso: "#F3E9DA",
  onEspressoMuted: "rgba(243, 233, 218, 0.72)",
  /// For 10-11px type, where 0.5 lands under the contrast floor.
  onEspressoFaint: "rgba(243, 233, 218, 0.62)",
  /// Structural layers on the dark shell: hover grounds and hairlines.
  onEspressoWash: "rgba(243, 233, 218, 0.09)",
  onEspressoLine: "rgba(243, 233, 218, 0.14)",
  /// The reverse — a dark wash for badges sitting on the amber active pill.
  espressoWash: "rgba(59, 35, 23, 0.16)",
  /// Cream canvas the printed menus sit on.
  canvas: "#FBF6EC",
  canvasDeep: "#F4EADB",
  /// The canvas again, translucent, for the blurred sticky bars.
  canvasVeil: "rgba(251, 246, 236, 0.86)",
  surface: "#FFFDF8",
  /// The surface, translucent, for chips that float over a photograph.
  surfaceVeil: "rgba(255, 253, 248, 0.92)",
  surfaceAlt: "#F7F0E3",
  border: "#E7DAC5",
  borderSoft: "#F0E6D6",
  textHeading: "#33200F",
  textBody: "#5A4636",
  /// Deep enough to carry 12px secondary text: the table's second lines, the
  /// sizes column, page subtitles and every form hint are this colour, and at
  /// its old value they sat around 3.4:1 on cream.
  textMuted: "#7F6C55",
  /// Matcha green from the second menu — the app's secondary accent.
  matcha: "#2F5D3A",
  success: "#3F8F5B",
  warning: "#D98324",
  danger: "#C0442F",
  info: "#3B7EA1",
} as const;

/// The category accents from the printed menus. A new category takes the first
/// one nothing else is using: seeding every category with the brand amber makes
/// the accent stop distinguishing anything, and makes each section read as the
/// same colour as the "Add to cart" button.
export const categoryAccents = [
  "#8A4B2A",
  "#C97B32",
  "#4E9A51",
  "#A9856B",
  "#B07BC4",
  "#2E9BB5",
] as const;

export const brandFonts = {
  display: `"Fraunces", "Playfair Display", Georgia, serif`,
  body: `"Inter", -apple-system, "Segoe UI", Roboto, sans-serif`,
} as const;

/// Status colours for the order lifecycle, reused by the tracker and the queue,
/// and for account access on the Users screen — `pending` reads the same way in
/// both, so it is deliberately one entry.
///
/// Each `fg` is the deepest version of its own hue that still reads on its `bg`
/// at 4.5:1. The pills carry 11px bold text on a tinted ground, which is the
/// least forgiving place in the app: at their original values six of the seven
/// sat between 3.3 and 4.4, `pending` worst of all.
export const statusPalette: Record<string, { fg: string; bg: string }> = {
  pending: { fg: "#8B5A15", bg: "#FBEBD2" },
  preparing: { fg: "#3B6981", bg: "#E1EFF6" },
  ready: { fg: "#307145", bg: "#DFF1E4" },
  completed: { fg: "#6B4A38", bg: "#F0E6D6" },
  cancelled: { fg: "#B0402C", bg: "#F8E0DC" },
  approved: { fg: "#307145", bg: "#DFF1E4" },
  revoked: { fg: "#B0402C", bg: "#F8E0DC" },
};
