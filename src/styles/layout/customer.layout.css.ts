import { style } from "@vanilla-extract/css";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvas,
  colorCanvasVeil,
  colorEspresso,
  colorOnEspresso,
  colorOnEspressoFaint,
  colorOnEspressoLine,
  colorPrimary,
  colorSurface,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusLg,
  radiusPill,
  shadowLifted,
  shadowSoft,
} from "../common/vars.css";

export const shell = style({
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: colorCanvas,
  // Warm halo behind the header so the cream does not read as flat paper.
  backgroundImage: `radial-gradient(120% 60% at 50% -10%, rgba(233,161,59,0.18), transparent 60%)`,
  backgroundRepeat: "no-repeat",
});

export const header = style({
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 20px",
  paddingTop: "max(14px, env(safe-area-inset-top))",
  backgroundColor: colorCanvasVeil,
  backdropFilter: "saturate(180%) blur(14px)",
  WebkitBackdropFilter: "saturate(180%) blur(14px)",
  borderBottom: `1px solid ${colorBorderSoft}`,
});

export const brandMark = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  textDecoration: "none",
});

// The lockup carries its own row so the wordmark sits beside the roundel even
// where the caller wraps BrandMark in chrome of its own (the admin sider, the
// login pane) rather than passing a layout class down.
export const brandLockup = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
});

export const brandRoundel = style({
  width: 34,
  height: 34,
  borderRadius: radiusPill,
  backgroundColor: colorPrimary,
  display: "grid",
  placeItems: "center",
  boxShadow: shadowSoft,
  flexShrink: 0,
});

export const brandBars = style({
  display: "flex",
  gap: 3,
});

export const brandBar = style({
  width: 4,
  height: 15,
  borderRadius: 2,
  backgroundColor: colorEspresso,
});

export const brandStack = style({
  display: "flex",
  flexDirection: "column",
});

export const brandWord = style({
  display: "block",
  fontFamily: fontDisplay,
  fontWeight: 600,
  fontSize: 19,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: colorTextHeading,
  lineHeight: 1,
});

export const brandSub = style({
  display: "block",
  fontSize: 8.5,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: colorTextMuted,
  lineHeight: 1,
  marginTop: 3,
});

export const brandWordLight = style({
  color: colorOnEspresso,
});

export const brandSubLight = style({
  color: colorOnEspressoFaint,
});

export const headerActions = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const iconButton = style({
  width: 40,
  height: 40,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  color: colorTextHeading,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  fontSize: 17,
  transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
  selectors: {
    "&:hover": {
      borderColor: colorPrimary,
      boxShadow: shadowSoft,
      transform: "translateY(-1px)",
    },
    "&:active": { transform: "translateY(0)" },
  },
});

export const main = style({
  flex: 1,
  width: "100%",
  maxWidth: 1120,
  margin: "0 auto",
  padding: "0 20px 140px",
  "@media": {
    "screen and (max-width: 640px)": { padding: "0 16px 150px" },
  },
});

// ------------------------------------------------------------- sticky cart bar

export const cartBar = style({
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "max(18px, env(safe-area-inset-bottom))",
  zIndex: 30,
  width: "min(560px, calc(100% - 32px))",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "12px 14px 12px 20px",
  borderRadius: radiusPill,
  backgroundColor: colorEspresso,
  boxShadow: shadowLifted,
  border: `1px solid ${colorOnEspressoLine}`,
  cursor: "pointer",
  color: colorOnEspresso,
  transition: "transform .18s ease",
  selectors: {
    "&:hover": { transform: "translateX(-50%) translateY(-2px)" },
  },
});

export const cartBarMeta = style({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
});

export const cartBarCount = style({
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  opacity: 0.66,
});

export const cartBarTotal = style({
  fontFamily: fontDisplay,
  fontSize: 19,
  fontWeight: 600,
  lineHeight: 1.1,
});

export const cartBarAction = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  borderRadius: radiusPill,
  backgroundColor: colorPrimary,
  color: colorEspresso,
  fontWeight: 700,
  fontSize: 14,
  whiteSpace: "nowrap",
});

// ----------------------------------------------------------------- page shell

export const pageHead = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "26px 0 18px",
});

export const pageTitle = style({
  fontFamily: fontDisplay,
  fontSize: 30,
  fontWeight: 600,
  color: colorTextHeading,
  letterSpacing: "-0.02em",
  margin: 0,
  lineHeight: 1.15,
});

export const pageSubtitle = style({
  marginTop: 6,
  fontSize: 14,
  color: colorTextMuted,
});

export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: colorTextBody,
  background: "none",
  border: "none",
  padding: "8px 0",
  cursor: "pointer",
  selectors: { "&:hover": { color: colorPrimary } },
});

export const panel = style({
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusLg,
  boxShadow: shadowSoft,
  padding: 20,
});


