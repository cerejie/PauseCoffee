import { style } from "@vanilla-extract/css";
import {
  accent,
  colorBorder,
  colorBorderSoft,
  colorCanvasDeep,
  colorDanger,
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
  shadowSoft,
} from "../common/vars.css";

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 1fr)",
  gap: 20,
  alignItems: "start",
  "@media": {
    "screen and (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
});

export const lineList = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
});

export const line = style({
  position: "relative",
  display: "flex",
  gap: 14,
  padding: 16,
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  overflow: "hidden",
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      insetBlock: 0,
      left: 0,
      width: 3,
      backgroundColor: accent,
    },
  },
});

export const lineBody = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
});

export const lineTitle = style({
  fontFamily: fontDisplay,
  fontSize: 16,
  fontWeight: 600,
  color: colorTextHeading,
  margin: 0,
  lineHeight: 1.25,
});

export const lineOptions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
});

export const lineOptionChip = style({
  fontSize: 11,
  fontWeight: 600,
  color: colorTextBody,
  padding: "3px 9px",
  borderRadius: radiusPill,
  backgroundColor: colorSurfaceAlt,
  border: `1px solid ${colorBorderSoft}`,
});

export const lineNote = style({
  fontSize: 12,
  fontStyle: "italic",
  color: colorTextMuted,
});

export const lineActions = style({
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginTop: 4,
});

export const lineLink = style({
  border: "none",
  background: "none",
  padding: 0,
  fontSize: 12.5,
  fontWeight: 600,
  color: colorTextMuted,
  cursor: "pointer",
  selectors: { "&:hover": { color: colorTextHeading } },
});

export const lineLinkDanger = style({
  selectors: { "&:hover": { color: colorDanger } },
});

export const lineTail = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 12,
  flexShrink: 0,
});

export const linePrice = style({
  fontFamily: fontDisplay,
  fontSize: 17,
  fontWeight: 600,
  color: colorTextHeading,
  whiteSpace: "nowrap",
});

export const stepper = style({
  display: "flex",
  alignItems: "center",
  gap: 2,
  padding: 2,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurfaceAlt,
});

export const stepperButton = style({
  width: 28,
  height: 28,
  borderRadius: radiusPill,
  border: "none",
  background: "transparent",
  color: colorTextHeading,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  selectors: {
    "&:hover:not(:disabled)": { backgroundColor: colorSurface },
    "&:disabled": { opacity: 0.35, cursor: "not-allowed" },
  },
});

export const stepperValue = style({
  minWidth: 22,
  textAlign: "center",
  fontSize: 13.5,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  color: colorTextHeading,
});

// ------------------------------------------------------------------- summary

export const summary = style({
  position: "sticky",
  top: 88,
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
  overflow: "hidden",
  "@media": {
    "screen and (max-width: 900px)": { position: "static" },
  },
});

export const summaryHead = style({
  padding: "18px 20px 14px",
  borderBottom: `1px dashed ${colorBorder}`,
});

export const summaryTitle = style({
  fontFamily: fontDisplay,
  fontSize: 19,
  fontWeight: 600,
  color: colorTextHeading,
  margin: 0,
});

export const summaryBody = style({
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
});

export const fieldLabel = style({
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase",
  color: colorTextHeading,
  marginBottom: 8,
  display: "block",
});

export const typeRow = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
});

export const typeTile = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 5,
  padding: "13px 10px",
  borderRadius: radiusMd,
  border: `1.5px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: colorTextBody,
  transition: "all .16s ease",
  selectors: { "&:hover": { borderColor: colorPrimary } },
});

export const typeTileActive = style({
  borderColor: colorPrimary,
  backgroundColor: colorSurfaceAlt,
  color: colorTextHeading,
});

export const totalsRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 13.5,
  color: colorTextBody,
});

export const totalsDivider = style({
  height: 1,
  backgroundColor: colorBorderSoft,
  margin: "2px 0",
});

export const totalsGrand = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  paddingTop: 4,
});

export const totalsGrandLabel = style({
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const totalsGrandValue = style({
  fontFamily: fontDisplay,
  fontSize: 27,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1,
});

export const summaryFooter = style({
  padding: "0 20px 20px",
});

export const proceedButton = style({
  width: "100%",
  height: 52,
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: colorPrimary,
  color: colorEspresso,
  fontSize: 15.5,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  boxShadow: shadowSoft,
  transition: "filter .16s ease, transform .16s ease",
  selectors: {
    "&:hover:not(:disabled)": { filter: "brightness(1.05)" },
    "&:active:not(:disabled)": { transform: "scale(0.99)" },
    "&:disabled": { opacity: 0.55, cursor: "not-allowed", boxShadow: "none" },
  },
});

export const proceedHint = style({
  marginTop: 10,
  fontSize: 11.5,
  color: colorTextMuted,
  textAlign: "center",
  lineHeight: 1.5,
});

export const empty = style({
  padding: "70px 24px",
  textAlign: "center",
  borderRadius: radiusLg,
  border: `1px dashed ${colorBorder}`,
  backgroundColor: colorCanvasDeep,
});

export const emptyTitle = style({
  fontFamily: fontDisplay,
  fontSize: 21,
  fontWeight: 600,
  color: colorTextHeading,
  margin: "14px 0 6px",
});
