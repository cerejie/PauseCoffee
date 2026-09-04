import { style, keyframes } from "@vanilla-extract/css";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvas,
  colorEspresso,
  colorPrimary,
  colorSurface,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusLg,
  radiusMd,
  radiusPill,
  shadowLifted,
  shadowSoft,
} from "../common/vars.css";

const blink = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.25 },
});

export const shell = style({
  display: "flex",
  minHeight: "100dvh",
  backgroundColor: colorCanvas,
});

// ---------------------------------------------------------------------- sider

export const sider = style({
  width: 232,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: "20px 14px",
  backgroundColor: colorEspresso,
  color: "#EADFCF",
  position: "sticky",
  top: 0,
  height: "100dvh",
  "@media": {
    "screen and (max-width: 900px)": { display: "none" },
  },
});

export const siderBrand = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "4px 8px 22px",
});

export const navItem = style({
  display: "flex",
  alignItems: "center",
  gap: 11,
  padding: "11px 13px",
  borderRadius: radiusMd,
  color: "rgba(234,223,207,0.72)",
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  transition: "background-color .16s ease, color .16s ease",
  selectors: {
    "&:hover": { backgroundColor: "rgba(255,255,255,0.06)", color: "#F7EFE3" },
  },
});

export const navItemActive = style({
  backgroundColor: colorPrimary,
  color: colorEspresso,
  selectors: {
    "&:hover": { backgroundColor: colorPrimary, color: colorEspresso },
  },
});

export const navBadge = style({
  marginLeft: "auto",
  minWidth: 20,
  height: 20,
  padding: "0 6px",
  borderRadius: radiusPill,
  backgroundColor: "rgba(255,255,255,0.16)",
  fontSize: 11,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
});

export const navBadgeActive = style({
  backgroundColor: "rgba(59,35,23,0.16)",
});

export const siderFooter = style({
  marginTop: "auto",
  paddingTop: 14,
  borderTop: "1px solid rgba(255,255,255,0.1)",
});

export const siderUser = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 6px 12px",
});

export const siderAvatar = style({
  width: 32,
  height: 32,
  borderRadius: radiusPill,
  backgroundColor: "rgba(255,255,255,0.12)",
  display: "grid",
  placeItems: "center",
  fontSize: 13,
  fontWeight: 700,
  flexShrink: 0,
});

export const siderUserName = style({
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const siderUserRole = style({
  fontSize: 10.5,
  opacity: 0.55,
  textTransform: "capitalize",
});

// --------------------------------------------------------------------- body

export const body = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

export const header = style({
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "14px 24px",
  paddingTop: "max(14px, env(safe-area-inset-top))",
  backgroundColor: "rgba(251,246,236,0.86)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: `1px solid ${colorBorderSoft}`,
  "@media": {
    "screen and (max-width: 900px)": { padding: "12px 16px" },
  },
});

export const headerTitle = style({
  fontFamily: fontDisplay,
  fontSize: 22,
  fontWeight: 600,
  color: colorTextHeading,
  margin: 0,
  letterSpacing: "-0.01em",
});

export const headerSub = style({
  fontSize: 12.5,
  color: colorTextMuted,
  marginTop: 2,
});

export const headerActions = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

/// Live indicator — green while the realtime channel is subscribed, amber the
/// moment it drops, so a barista can trust the board or know to refresh.
export const liveChip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "6px 12px",
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  fontSize: 12,
  fontWeight: 600,
  color: colorTextMuted,
});

export const liveDot = style({
  width: 7,
  height: 7,
  borderRadius: radiusPill,
  backgroundColor: colorTextMuted,
});

export const liveDotOn = style({
  backgroundColor: "#3F8F5B",
  animation: `${blink} 2s ease-in-out infinite`,
});

export const content = style({
  flex: 1,
  padding: "22px 24px 40px",
  "@media": {
    "screen and (max-width: 900px)": { padding: "16px 16px 96px" },
  },
});

// ------------------------------------------------------------- mobile tab bar

export const tabBar = style({
  display: "none",
  position: "fixed",
  left: 12,
  right: 12,
  bottom: "max(12px, env(safe-area-inset-bottom))",
  zIndex: 20,
  padding: 6,
  borderRadius: radiusPill,
  backgroundColor: colorEspresso,
  boxShadow: shadowLifted,
  "@media": {
    "screen and (max-width: 900px)": { display: "flex" },
  },
});

export const tabItem = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  padding: "8px 4px",
  borderRadius: radiusPill,
  color: "rgba(234,223,207,0.7)",
  fontSize: 10.5,
  fontWeight: 600,
  textDecoration: "none",
});

export const tabItemActive = style({
  backgroundColor: colorPrimary,
  color: colorEspresso,
});

// -------------------------------------------------------------------- panels

export const panel = style({
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
  overflow: "hidden",
});

export const toolbar = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  padding: "14px 16px",
  borderBottom: `1px solid ${colorBorderSoft}`,
});

export const toolbarSearch = style({
  flex: 1,
  minWidth: 200,
  maxWidth: 340,
});

export const toolbarControl = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginLeft: "auto",
});
