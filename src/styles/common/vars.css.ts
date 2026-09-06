import { createVar } from "@vanilla-extract/css";

/// The style contract. Every `*.css.ts` in the app reads these and nothing
/// else — the values are assigned once at the app root by useBrandVars so a
/// theme change reaches every rule without touching a stylesheet.

export const colorPrimary = createVar();
export const colorPrimaryDeep = createVar();
export const colorPrimarySoft = createVar();

export const colorEspresso = createVar();
export const colorEspressoSoft = createVar();
/// Reading on the espresso shell — the admin sider, the mobile tab bar, the
/// login panel. Four tiers of one cream: ink, secondary, small-type, and the
/// wash/hairline pair that carries hovers and dividers.
export const colorOnEspresso = createVar();
export const colorOnEspressoMuted = createVar();
export const colorOnEspressoFaint = createVar();
export const colorOnEspressoWash = createVar();
export const colorOnEspressoLine = createVar();
/// The reverse: a dark wash for what sits on the amber active pill.
export const colorEspressoWash = createVar();

export const colorCanvas = createVar();
export const colorCanvasDeep = createVar();
export const colorSurface = createVar();
export const colorSurfaceAlt = createVar();
/// The surface at reading opacity, for chips floating over a photograph.
export const colorSurfaceVeil = createVar();
/// The canvas at reading opacity, for the blurred bars that pin themselves
/// over the page. The header and the category rail must share it exactly or
/// the seam between them shows once the rail docks.
export const colorCanvasVeil = createVar();

export const colorBorder = createVar();
export const colorBorderSoft = createVar();

export const colorTextHeading = createVar();
export const colorTextBody = createVar();
export const colorTextMuted = createVar();

export const colorMatcha = createVar();
export const colorSuccess = createVar();
export const colorWarning = createVar();
export const colorDanger = createVar();
export const colorInfo = createVar();

export const fontDisplay = createVar();
export const fontBody = createVar();

/// Per-instance accent — a category tab, a menu section, a status pill each
/// assign this locally so one rule set serves every colour on the menu.
export const accent = createVar();
export const accentSoft = createVar();
/// The accent deepened until it reads as text on accentSoft, and the foreground
/// that goes on top of a solid accent fill. Both are derived from the one seed
/// colour by useAccentVars: the shop can pick anything in the admin, and the
/// brand amber on its own tint is about 2:1 — a pair like that has to be
/// computed rather than assumed.
export const accentInk = createVar();
export const accentOn = createVar();

export const radiusSm = "10px";
export const radiusMd = "16px";
export const radiusLg = "22px";
export const radiusPill = "999px";

export const shadowSoft = "0 1px 2px rgba(59, 35, 23, 0.04), 0 4px 16px rgba(59, 35, 23, 0.05)";
export const shadowLifted = "0 2px 6px rgba(59, 35, 23, 0.06), 0 14px 34px rgba(59, 35, 23, 0.10)";
export const shadowInset = "inset 0 1px 0 rgba(255, 255, 255, 0.6)";

/// Height of the customer header, published by useStickyHeaderHook. It is not
/// a constant — `env(safe-area-inset-top)` makes the bar taller on a notched
/// phone — so anything that pins itself under the header reads this rather
/// than guessing.
export const stickyHeaderHeight = createVar();
