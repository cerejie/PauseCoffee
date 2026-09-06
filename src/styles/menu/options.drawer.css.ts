import { style } from "@vanilla-extract/css";
import {
  accent,
  accentInk,
  accentOn,
  accentSoft,
  colorBorder,
  colorBorderSoft,
  colorEspresso,
  colorPrimary,
  colorSurface,
  colorSurfaceAlt,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusLg,
  radiusMd,
  radiusPill,
  radiusSm,
  shadowSoft,
} from "../common/vars.css";

export const drawerRoot = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: colorSurface,
});

export const head = style({
  position: "relative",
  padding: "26px 22px 20px",
  backgroundColor: accentSoft,
  borderBottom: `1px solid ${colorBorderSoft}`,
});

export const headBadge = style({
  display: "inline-block",
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: accentInk,
  marginBottom: 8,
});

export const headTitle = style({
  fontFamily: fontDisplay,
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  color: colorTextHeading,
  margin: 0,
  lineHeight: 1.15,
  paddingRight: 40,
});

export const headDescription = style({
  marginTop: 7,
  fontSize: 13.5,
  color: colorTextBody,
  lineHeight: 1.55,
  maxWidth: 460,
});

export const closeButton = style({
  position: "absolute",
  zIndex: 2,
  top: 18,
  right: 18,
  width: 32,
  height: 32,
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: "rgba(255,255,255,0.7)",
  color: colorTextHeading,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  fontSize: 13,
  selectors: { "&:hover": { backgroundColor: colorSurface } },
});

export const body = style({
  flex: 1,
  overflowY: "auto",
  padding: "20px 22px 26px",
  display: "flex",
  flexDirection: "column",
  gap: 24,
});

export const group = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
});

export const groupLabel = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
});

export const groupTitle = style({
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: colorTextHeading,
});

export const groupHint = style({
  fontSize: 11.5,
  color: colorTextMuted,
});

/// Option tiles — used for size, temperature and sweetness alike so the three
/// groups read as one control language.
export const optionRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
  gap: 8,
});

export const optionTile = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 3,
  padding: "11px 13px",
  borderRadius: radiusMd,
  border: `1.5px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  cursor: "pointer",
  transition: "border-color .16s ease, background-color .16s ease, transform .16s ease",
  selectors: {
    "&:hover": { borderColor: accent },
    "&:active": { transform: "scale(0.985)" },
  },
});

export const optionTileActive = style({
  borderColor: accent,
  backgroundColor: accentSoft,
});

export const optionTileLabel = style({
  fontSize: 13.5,
  fontWeight: 600,
  color: colorTextHeading,
});

export const optionTileMeta = style({
  fontSize: 11.5,
  color: colorTextMuted,
});

// ------------------------------------------------------------------- add-ons

export const addonList = style({
  display: "flex",
  flexDirection: "column",
  gap: 7,
});

export const addonRow = style({
  display: "flex",
  alignItems: "center",
  gap: 11,
  padding: "10px 13px",
  borderRadius: radiusMd,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurfaceAlt,
  cursor: "pointer",
  transition: "border-color .16s ease, background-color .16s ease",
  selectors: {
    "&:hover": { borderColor: colorBorder },
  },
});

export const addonRowActive = style({
  borderColor: accent,
  backgroundColor: accentSoft,
});

export const addonCheck = style({
  width: 19,
  height: 19,
  borderRadius: radiusSm,
  border: `1.5px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  display: "grid",
  placeItems: "center",
  fontSize: 10,
  color: "transparent",
  flexShrink: 0,
  transition: "all .16s ease",
});

export const addonCheckActive = style({
  borderColor: accent,
  backgroundColor: accent,
  color: accentOn,
});

export const addonName = style({
  flex: 1,
  fontSize: 13.5,
  fontWeight: 500,
  color: colorTextHeading,
});

export const addonPrice = style({
  fontSize: 12.5,
  fontWeight: 600,
  color: colorTextMuted,
});

// -------------------------------------------------------------------- footer

export const footer = style({
  borderTop: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  padding: "14px 22px",
  paddingBottom: "max(14px, env(safe-area-inset-bottom))",
  display: "flex",
  alignItems: "center",
  gap: 12,
});

export const stepper = style({
  display: "flex",
  alignItems: "center",
  gap: 2,
  padding: 3,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurfaceAlt,
  flexShrink: 0,
});

export const stepperButton = style({
  width: 32,
  height: 32,
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: "transparent",
  color: colorTextHeading,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  fontSize: 13,
  transition: "background-color .16s ease",
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: colorSurface },
    "&:disabled": { opacity: 0.35, cursor: "not-allowed" },
  },
});

export const stepperValue = style({
  minWidth: 26,
  textAlign: "center",
  fontSize: 14.5,
  fontWeight: 700,
  color: colorTextHeading,
  fontVariantNumeric: "tabular-nums",
});

export const submit = style({
  flex: 1,
  height: 48,
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: colorPrimary,
  color: colorEspresso,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  boxShadow: shadowSoft,
  transition: "transform .16s ease, filter .16s ease",
  selectors: {
    "&:hover": { filter: "brightness(1.04)" },
    "&:active": { transform: "scale(0.99)" },
  },
});

export const submitDivider = style({
  width: 1,
  height: 18,
  backgroundColor: "rgba(59,35,23,0.22)",
});

export const notesField = style({
  borderRadius: radiusLg,
});
