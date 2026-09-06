import { createVar, fallbackVar, keyframes, style } from "@vanilla-extract/css";
import {
  accent,
  accentInk,
  accentOn,
  accentSoft,
  colorBorder,
  colorBorderSoft,
  colorCanvasDeep,
  colorCanvasVeil,
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
  stickyHeaderHeight,
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

/// Where the docked chrome ends. The header measures itself into
/// stickyHeaderHeight; the fallback only covers the first paint.
const railTop = fallbackVar(stickyHeaderHeight, "68px");

/// Geometry of the active chip, measured by CategoryRail and handed back in.
export const railThumbX = createVar();
export const railThumbWidth = createVar();

export const rail = style({
  position: "sticky",
  top: railTop,
  zIndex: 15,
  display: "flex",
  overflowX: "auto",
  overscrollBehaviorX: "contain",
  padding: "10px 0",
  margin: "0 -20px",
  paddingInline: 20,
  scrollbarWidth: "none",
  backgroundColor: colorCanvasVeil,
  backdropFilter: "saturate(180%) blur(12px)",
  WebkitBackdropFilter: "saturate(180%) blur(12px)",
  // Grows in as the rail docks, so the band reads as a layer over the menu
  // rather than a strip that was always there.
  borderBottom: "1px solid transparent",
  transition: "border-color .24s ease, box-shadow .24s ease",
  selectors: {
    "&::-webkit-scrollbar": { display: "none" },
  },
  "@media": {
    "screen and (max-width: 640px)": {
      margin: "0 -16px",
      paddingInline: 16,
    },
  },
});

export const railPinned = style({
  borderBottomColor: colorBorderSoft,
  boxShadow: "0 12px 26px -20px rgba(59, 35, 23, 0.6)",
});

/// The chips share one track so the indicator can travel behind all of them
/// without an opaque neighbour cutting it in half mid-slide.
export const railTrack = style({
  position: "relative",
  display: "inline-flex",
  gap: 2,
  padding: 4,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurfaceAlt,
});

export const railThumb = style({
  position: "absolute",
  insetBlock: 4,
  left: 0,
  width: railThumbWidth,
  borderRadius: radiusPill,
  backgroundColor: accent,
  boxShadow: shadowSoft,
  pointerEvents: "none",
  transform: `translateX(${railThumbX})`,
  // The travel is the whole point: scrolling the menu glides the pill between
  // categories instead of snapping it, so the rail reads as one moving thing.
  transition:
    "transform .34s cubic-bezier(.22,1,.36,1), width .34s cubic-bezier(.22,1,.36,1), background-color .34s ease, opacity .2s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "opacity .2s ease" },
  },
});

/// Before the first measurement there is nowhere honest to put it.
export const railThumbHidden = style({
  opacity: 0,
});

export const railChip = style({
  position: "relative",
  zIndex: 1,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "8px 15px",
  borderRadius: radiusPill,
  border: "none",
  background: "none",
  color: colorTextBody,
  fontSize: 13.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "color .22s ease",
  selectors: {
    "&:hover": { color: colorTextHeading },
  },
});

export const railChipActive = style({
  color: accentOn,
  selectors: {
    "&:hover": { color: accentOn },
  },
});

export const railDot = style({
  width: 7,
  height: 7,
  borderRadius: radiusPill,
  backgroundColor: accent,
  transition: "background-color .22s ease, transform .22s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const railDotActive = style({
  backgroundColor: accentOn,
  opacity: 0.85,
  transform: "scale(1.15)",
});

// ------------------------------------------------------------------ sections

export const section = style({
  // Only the browser's own anchor jumps land here — a tapped chip is placed by
  // useCategoryScrollHook against the rail's measured edge.
  scrollMarginTop: `calc(${railTop} + 62px)`,
  paddingTop: 30,
});

const headingRise = keyframes({
  from: { opacity: 0, transform: "translateY(14px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const sectionHead = style({
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  marginBottom: 4,
  // Tied to the scroll position rather than to a timer, so the heading rises as
  // the customer swipes and reverses if they swipe back. Opted into rather than
  // out of: an `@supports` block outranks the `reduce` override by source order,
  // so the calm-motion case has to be the one that never declares it. Browsers
  // without scroll-driven animations simply show the heading.
  "@media": {
    "(prefers-reduced-motion: no-preference)": {
      "@supports": {
        "(animation-timeline: view())": {
          animationName: headingRise,
          animationFillMode: "both",
          animationTimingFunction: "linear",
          animationDuration: "1ms",
          animationTimeline: "view()",
          animationRange: "entry 10% cover 16%",
        },
      },
    },
  },
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
  color: accentInk,
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
  color: accentInk,
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
