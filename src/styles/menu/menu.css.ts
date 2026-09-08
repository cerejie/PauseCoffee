import { fallbackVar, globalStyle, keyframes, style } from "@vanilla-extract/css";
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
  colorPrimaryDeep,
  colorSurface,
  colorSurfaceAlt,
  colorSurfaceVeil,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontBody,
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

/// Each chip is its own pill, so the row can breathe rather than reading as one
/// segmented control — the gaps are what let the current category stand out by
/// filling with its own accent.
export const railTrack = style({
  display: "inline-flex",
  gap: 10,
  padding: "2px 0",
});

export const railChip = style({
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 19px",
  borderRadius: radiusPill,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
  color: colorTextHeading,
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition:
    "background-color .24s ease, color .24s ease, border-color .24s ease, box-shadow .24s ease, transform .18s ease",
  selectors: {
    "&:hover": { borderColor: colorBorder, transform: "translateY(-1px)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const railChipActive = style({
  backgroundColor: accent,
  borderColor: "transparent",
  color: accentOn,
  boxShadow: shadowLifted,
  selectors: {
    "&:hover": { borderColor: "transparent" },
  },
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
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  color: colorTextHeading,
  margin: 0,
});

export const sectionRule = style({
  flex: 1,
  height: 1,
  backgroundColor: colorBorder,
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
    // Two up on a phone. The card turns portrait at the same breakpoint, so a
    // full-width row was spending the whole fold on three products.
    "screen and (max-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      columnGap: 11,
      rowGap: 14,
    },
  },
});

// -------------------------------------------------------------- product card

export const card = style({
  position: "relative",
  display: "flex",
  alignItems: "stretch",
  gap: 13,
  padding: 10,
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
    "&:active": { transform: "scale(.98)" },
  },
  WebkitTapHighlightColor: "transparent",
  "@media": {
    // Portrait at half a phone width: the photo takes the full card width and
    // the body sits under it, so the name still has a line to itself.
    "screen and (max-width: 640px)": {
      flexDirection: "column",
      gap: 0,
      padding: 0,
      boxShadow: shadowSoft,
    },
  },
});

export const cardBody = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 5,
  padding: "5px 4px 3px 0",
  "@media": {
    "screen and (max-width: 640px)": {
      gap: 3,
      padding: "9px 11px 11px",
    },
  },
});

/// Above the name rather than beside it: "BEST SELLER" is the first thing worth
/// reading on the card, and hanging it off the title wrapped the name in half
/// the column widths the grid produces.
export const cardBadge = style({
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "3px 8px",
  borderRadius: radiusPill,
  color: accentInk,
  backgroundColor: accentSoft,
  marginBottom: 1,
  "@media": {
    // The accent tint is 14% alpha — legible on the card, not over a photo —
    // so on the portrait card the badge rides the picture on its own veil.
    "screen and (max-width: 640px)": {
      position: "absolute",
      top: 8,
      left: 8,
      zIndex: 1,
      marginBottom: 0,
      fontSize: 8.5,
      padding: "3px 7px",
      color: colorTextHeading,
      backgroundColor: colorSurfaceVeil,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      boxShadow: shadowSoft,
    },
  },
});

export const cardTitle = style({
  fontFamily: fontBody,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: colorTextHeading,
  lineHeight: 1.3,
  margin: 0,
  "@media": {
    "screen and (max-width: 640px)": {
      fontSize: 13.5,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
  },
});

export const cardDescription = style({
  fontSize: 12.5,
  color: colorTextMuted,
  lineHeight: 1.5,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  "@media": {
    "screen and (max-width: 640px)": {
      fontSize: 11.5,
      lineHeight: 1.45,
      WebkitLineClamp: 1,
    },
  },
});

/// The customer card prices from one line now — "12 oz  P210", or "from" when
/// there is a choice — so the per-size chips are left for the admin product
/// table, which is where every size still has to be readable at a glance.
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

/// Pushed to the bottom of the body, so the price and the add button sit on one
/// line across a whole row however far the descriptions run.
export const cardFoot = style({
  marginTop: "auto",
  paddingTop: 10,
  width: "100%",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 10,
  "@media": {
    "screen and (max-width: 640px)": {
      alignItems: "center",
      paddingTop: 9,
      gap: 8,
    },
  },
});

export const cardPriceBlock = style({
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const cardPriceLabel = style({
  fontSize: 10.5,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: colorTextMuted,
  lineHeight: 1,
  "@media": {
    "screen and (max-width: 640px)": { fontSize: 9.5, letterSpacing: "0.08em" },
  },
});

export const cardPrice = style({
  fontFamily: fontBody,
  fontSize: 17,
  fontWeight: 700,
  color: colorTextHeading,
  lineHeight: 1.1,
  "@media": {
    "screen and (max-width: 640px)": { fontSize: 15 },
  },
});

export const cardAdd = style({
  flexShrink: 0,
  width: 36,
  height: 36,
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
    [`${card}:active &`]: { transform: "scale(.94)" },
  },
  "@media": {
    "screen and (max-width: 640px)": { width: 31, height: 31, fontSize: 13 },
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

export const groupTabLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1,
});

export const groupTabIcon = style({
  fontSize: 22,
  flexShrink: 0,
});

/// The control is one floating pill with the active group filled in. antd owns
/// the markup, so the shape is written onto its classes; scoping to the wrapper
/// puts these above the app-wide segmented rules in styles/common.
globalStyle(`${groupTabs} .ant-segmented`, {
  padding: 5,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurfaceVeil,
  boxShadow: shadowSoft,
});

/// rc-segmented puts the flex row on `-group`, not on the root, so the app-wide
/// gap has to be cleared there or the two pills sit apart inside the track.
globalStyle(`${groupTabs} .ant-segmented-group`, {
  gap: 0,
});

globalStyle(`${groupTabs} .ant-segmented-item`, {
  border: "none",
  borderRadius: radiusPill,
  backgroundColor: "transparent",
  color: colorTextBody,
});

globalStyle(`${groupTabs} .ant-segmented-item:hover:not(.ant-segmented-item-selected)`, {
  backgroundColor: "transparent",
  color: colorTextHeading,
});

globalStyle(`${groupTabs} .ant-segmented-item-label`, {
  padding: "10px 26px",
  minHeight: "unset",
  lineHeight: 1,
});

/// The thumb is what the eye follows while the tab slides, so it carries the
/// same fill as the seat it lands in — otherwise the amber drops out for the
/// length of the animation.
globalStyle(
  `${groupTabs} .ant-segmented-item-selected, ${groupTabs} .ant-segmented-thumb`,
  {
    borderRadius: radiusPill,
    backgroundImage: `linear-gradient(135deg, ${colorPrimary}, ${colorPrimaryDeep})`,
    boxShadow: shadowSoft,
  },
);

/// Espresso rather than the mockup's white: 16px type on the brand amber is
/// about 2:1 in white, and every other amber control in the app already inks
/// itself this way.
globalStyle(`${groupTabs} .ant-segmented-item-selected`, {
  color: colorEspresso,
});
