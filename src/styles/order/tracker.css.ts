import { style, keyframes } from "@vanilla-extract/css";
import {
  accent,
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
  shadowLifted,
  shadowSoft,
} from "../common/vars.css";

const ripple = keyframes({
  "0%": { transform: "scale(1)", opacity: 0.45 },
  "100%": { transform: "scale(1.9)", opacity: 0 },
});

export const layout = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 380px)",
  gap: 20,
  alignItems: "start",
  "@media": {
    "screen and (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
});

/// The claim-code card — the one thing the customer shows at the counter, so
/// it gets the espresso ground and the largest type on the screen.
export const claimCard = style({
  position: "relative",
  overflow: "hidden",
  borderRadius: radiusLg,
  padding: "32px 26px",
  backgroundColor: colorEspresso,
  color: "#F7EFE3",
  boxShadow: shadowLifted,
  backgroundImage:
    "radial-gradient(120% 80% at 100% 0%, rgba(233,161,59,0.24), transparent 60%)",
});

export const claimLabel = style({
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  opacity: 0.62,
});

export const claimCode = style({
  fontFamily: fontDisplay,
  fontSize: 52,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: 1,
  margin: "10px 0 4px",
  fontVariantNumeric: "tabular-nums",
  "@media": {
    "screen and (max-width: 640px)": { fontSize: 42 },
  },
});

export const claimName = style({
  fontSize: 14,
  opacity: 0.78,
});

export const claimMeta = style({
  marginTop: 20,
  paddingTop: 18,
  borderTop: "1px solid rgba(255,255,255,0.14)",
  display: "flex",
  flexWrap: "wrap",
  gap: 22,
});

export const claimMetaItem = style({
  display: "flex",
  flexDirection: "column",
  gap: 3,
});

export const claimMetaLabel = style({
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  opacity: 0.55,
});

export const claimMetaValue = style({
  fontSize: 14.5,
  fontWeight: 600,
});

// -------------------------------------------------------------------- stepper

export const steps = style({
  marginTop: 18,
  padding: "22px 20px",
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
});

export const stepRow = style({
  display: "flex",
  gap: 16,
  position: "relative",
  paddingBottom: 22,
  selectors: {
    "&:last-child": { paddingBottom: 0 },
    // The connector line between dots.
    "&:not(:last-child)::before": {
      content: '""',
      position: "absolute",
      left: 15,
      top: 30,
      bottom: 4,
      width: 2,
      backgroundColor: colorBorderSoft,
      borderRadius: 1,
    },
  },
});

export const stepRowDone = style({
  selectors: {
    "&:not(:last-child)::before": { backgroundColor: accent },
  },
});

export const stepDot = style({
  position: "relative",
  width: 32,
  height: 32,
  borderRadius: radiusPill,
  border: `2px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  color: colorTextMuted,
  display: "grid",
  placeItems: "center",
  fontSize: 13,
  flexShrink: 0,
  zIndex: 1,
});

export const stepDotDone = style({
  borderColor: accent,
  backgroundColor: accent,
  color: accentOn,
});

/// The live step pulses so a glance tells you which stage the drink is at.
export const stepDotActive = style({
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: -2,
      borderRadius: radiusPill,
      border: `2px solid ${accent}`,
      animation: `${ripple} 1.9s ease-out infinite`,
    },
  },
});

export const stepBody = style({
  paddingTop: 4,
});

export const stepTitle = style({
  fontSize: 15,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1.2,
});

export const stepTitleMuted = style({
  color: colorTextMuted,
  fontWeight: 500,
});

export const stepMeta = style({
  fontSize: 12.5,
  color: colorTextMuted,
  marginTop: 3,
});

export const queueBanner = style({
  marginTop: 16,
  padding: "13px 16px",
  borderRadius: radiusMd,
  backgroundColor: accentSoft,
  border: `1px solid ${colorBorderSoft}`,
  fontSize: 13.5,
  color: colorTextHeading,
  display: "flex",
  alignItems: "center",
  gap: 10,
});

// -------------------------------------------------------------------- receipt

export const receipt = style({
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
  overflow: "hidden",
});

export const receiptHead = style({
  padding: "17px 20px 13px",
  borderBottom: `1px dashed ${colorBorder}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const receiptTitle = style({
  fontFamily: fontDisplay,
  fontSize: 17,
  fontWeight: 600,
  color: colorTextHeading,
  margin: 0,
});

export const receiptBody = style({
  padding: "6px 20px 16px",
});

export const receiptLine = style({
  display: "flex",
  gap: 12,
  padding: "12px 0",
  borderBottom: `1px solid ${colorBorderSoft}`,
  selectors: { "&:last-child": { borderBottom: "none" } },
});

export const receiptQty = style({
  minWidth: 26,
  height: 24,
  borderRadius: 7,
  backgroundColor: colorSurfaceAlt,
  color: colorTextHeading,
  fontSize: 12,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
});

export const receiptLineBody = style({
  flex: 1,
  minWidth: 0,
});

export const receiptLineName = style({
  fontSize: 14,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1.3,
});

export const receiptLineMeta = style({
  fontSize: 12,
  color: colorTextMuted,
  marginTop: 2,
  lineHeight: 1.45,
});

export const receiptLinePrice = style({
  fontSize: 13.5,
  fontWeight: 600,
  color: colorTextBody,
  whiteSpace: "nowrap",
});

export const receiptTotals = style({
  padding: "14px 20px 18px",
  borderTop: `1px dashed ${colorBorder}`,
  backgroundColor: colorSurfaceAlt,
});

export const receiptTotalRow = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
});

export const receiptTotalLabel = style({
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const receiptTotalValue = style({
  fontFamily: fontDisplay,
  fontSize: 24,
  fontWeight: 600,
  color: colorTextHeading,
});

export const actions = style({
  marginTop: 16,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
});

export const ghostButton = style({
  flex: 1,
  minWidth: 140,
  height: 46,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  color: colorTextHeading,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "border-color .16s ease",
  selectors: { "&:hover": { borderColor: colorPrimary } },
});

export const primaryButton = style({
  flex: 1,
  minWidth: 140,
  height: 46,
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: colorPrimary,
  color: colorEspresso,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: shadowSoft,
});
