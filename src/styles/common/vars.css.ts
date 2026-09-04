import { createVar } from "@vanilla-extract/css";

/// The style contract. Every `*.css.ts` in the app reads these and nothing
/// else — the values are assigned once at the app root by useBrandVars so a
/// theme change reaches every rule without touching a stylesheet.

export const colorPrimary = createVar();
export const colorPrimaryDeep = createVar();
export const colorPrimarySoft = createVar();

export const colorEspresso = createVar();
export const colorEspressoSoft = createVar();

export const colorCanvas = createVar();
export const colorCanvasDeep = createVar();
export const colorSurface = createVar();
export const colorSurfaceAlt = createVar();

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

export const radiusSm = "10px";
export const radiusMd = "16px";
export const radiusLg = "22px";
export const radiusPill = "999px";

export const shadowSoft = "0 1px 2px rgba(59, 35, 23, 0.04), 0 4px 16px rgba(59, 35, 23, 0.05)";
export const shadowLifted = "0 2px 6px rgba(59, 35, 23, 0.06), 0 14px 34px rgba(59, 35, 23, 0.10)";
export const shadowInset = "inset 0 1px 0 rgba(255, 255, 255, 0.6)";
