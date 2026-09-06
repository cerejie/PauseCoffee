import { style } from "@vanilla-extract/css";
import {
  accent,
  accentSoft,
  colorBorder,
  colorBorderSoft,
  colorCanvasDeep,
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
  shadowLifted,
  shadowSoft,
} from "../common/vars.css";

// ---------------------------------------------------------------------- hero

export const hero = style({
  padding: "30px 0 22px",
});

export const heroGreeting = style({
  fontSize: 12,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: colorTextMuted,
  marginBottom: 10,
});

export const heroTitle = style({
  fontFamily: fontDisplay,
  fontSize: 40,
  lineHeight: 1.06,
  fontWeight: 600,
  letterSpacing: "-0.03em",
  color: colorTextHeading,
  margin: 0,
  maxWidth: 460,
  "@media": {
    "screen and (max-width: 640px)": { fontSize: 32 },
  },
});

export const heroAccent = style({
  color: colorPrimary,
  fontStyle: "italic",
});

export const heroSearch = style({
  marginTop: 22,
  maxWidth: 420,
});

// ------------------------------------------------------------- category rail

export const rail = style({
  position: "sticky",
  top: 68,
  zIndex: 15,
  display: "flex",
  gap: 8,
  overflowX: "auto",
  padding: "12px 0",
  margin: "0 -20px",
  paddingInline: 20,
  scrollbarWidth: "none",
  backgroundColor: "rgba(251, 246, 236, 0.9)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  selectors: {
    "&::-webkit-scrollbar": { display: "none" },
  },
});

export const railChip = style({
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 16px",
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  color: colorTextBody,
  fontSize: 13.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "all .18s ease",
  selectors: {
    "&:hover": { borderColor: accent, color: colorTextHeading },
  },
});

export const railChipActive = style({
  borderColor: "transparent",
  backgroundColor: accent,
  color: colorSurface,
  boxShadow: shadowSoft,
});

export const railDot = style({
  width: 7,
  height: 7,
  borderRadius: radiusPill,
  backgroundColor: accent,
});

export const railDotActive = style({
  backgroundColor: "rgba(255,255,255,0.85)",
});

// ------------------------------------------------------------------ sections

export const section = style({
  scrollMarginTop: 128,
  paddingTop: 30,
});

export const sectionHead = style({
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  marginBottom: 4,
});

export const sectionTitle = style({
  fontFamily: fontDisplay,
  fontSize: 25,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  color: colorTextHeading,
  margin: 0,
});

export const sectionRule = style({
  flex: 1,
  height: 1,
  backgroundImage: `linear-gradient(to right, ${accentSoft}, transparent)`,
});

export const sectionCount = style({
  fontSize: 12,
  fontWeight: 600,
  color: accent,
  padding: "3px 9px",
  borderRadius: radiusPill,
  backgroundColor: accentSoft,
});

export const sectionTagline = style({
  fontSize: 13.5,
  color: colorTextMuted,
  fontStyle: "italic",
  marginBottom: 18,
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: 12,
  "@media": {
    "screen and (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

// -------------------------------------------------------------- product card

export const card = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "12px 16px 12px 12px",
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  transition: "transform .2s cubic-bezier(.2,.7,.3,1), box-shadow .2s ease, border-color .2s ease",
  overflow: "hidden",
  selectors: {
    // The accent bleeds in from the left edge on hover — the only colour a card
    // carries, so the grid stays calm until you reach for something.
    "&::before": {
      content: '""',
      position: "absolute",
      insetBlock: 0,
      left: 0,
      width: 3,
      backgroundColor: accent,
      opacity: 0,
      transition: "opacity .2s ease",
    },
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: shadowLifted,
      borderColor: colorBorder,
    },
    "&:hover::before": { opacity: 1 },
  },
});

export const cardBody = style({
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const cardTitleRow = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
});

export const cardTitle = style({
  fontFamily: fontDisplay,
  fontSize: 16.5,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1.25,
  margin: 0,
});

export const cardBadge = style({
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "3px 8px",
  borderRadius: radiusPill,
  color: accent,
  backgroundColor: accentSoft,
});

export const cardDescription = style({
  fontSize: 12.5,
  color: colorTextMuted,
  lineHeight: 1.5,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

export const cardSizes = style({
  display: "flex",
  gap: 6,
  marginTop: 6,
  flexWrap: "wrap",
});

export const cardSizeChip = style({
  fontSize: 11,
  fontWeight: 600,
  color: colorTextBody,
  padding: "3px 8px",
  borderRadius: radiusSm,
  backgroundColor: colorSurfaceAlt,
});

export const cardTail = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 10,
  flexShrink: 0,
});

export const cardPriceLabel = style({
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const cardPrice = style({
  fontFamily: fontDisplay,
  fontSize: 19,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1,
});

export const cardAdd = style({
  width: 34,
  height: 34,
  borderRadius: radiusPill,
  backgroundColor: colorPrimary,
  color: colorEspresso,
  display: "grid",
  placeItems: "center",
  fontSize: 15,
  boxShadow: shadowSoft,
  transition: "transform .18s ease",
  selectors: {
    [`${card}:hover &`]: { transform: "scale(1.08)" },
  },
});

// ------------------------------------------------------------- empty / error

export const emptyState = style({
  padding: "56px 20px",
  textAlign: "center",
  borderRadius: radiusLg,
  border: `1px dashed ${colorBorder}`,
  backgroundColor: colorCanvasDeep,
});

export const menuFooterNote = style({
  marginTop: 34,
  padding: "18px 20px",
  borderRadius: radiusMd,
  backgroundColor: colorSurfaceAlt,
  border: `1px solid ${colorBorderSoft}`,
  fontSize: 12.5,
  color: colorTextMuted,
  textAlign: "center",
});

// -------------------------------------------------------------- group tabs

export const groupTabs = style({
  display: "flex",
  paddingTop: 18,
});
