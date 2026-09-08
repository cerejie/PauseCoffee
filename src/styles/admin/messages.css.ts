import { style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorPrimary,
  colorPrimaryDeep,
  colorPrimarySoft,
  colorSurface,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusMd,
  radiusPill,
  shadowSoft,
} from "../common/vars.css";
import { easeOut } from "../common/motion.css";

/// The message inbox: one row per conversation, unanswered ones first.

export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  maxWidth: 720,
});

export const threadRow = style({
  display: "flex",
  alignItems: "center",
  gap: 14,
  width: "100%",
  padding: "14px 16px",
  textAlign: "left",
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusMd,
  boxShadow: shadowSoft,
  cursor: "pointer",
  transition: `transform 160ms ${easeOut}, border-color 160ms ${easeOut}`,
  selectors: {
    "&:hover": { transform: "translateY(-2px)", borderColor: colorPrimary },
    "&:active": { transform: "translateY(0) scale(0.995)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

/// An unanswered thread wears the accent on its edge — visible down the list
/// without reading a word of it.
export const threadRowUnread = style({
  borderColor: colorPrimary,
  backgroundColor: colorPrimarySoft,
});

export const threadBody = style({
  flex: 1,
  minWidth: 0,
});

export const threadHead = style({
  display: "flex",
  alignItems: "baseline",
  gap: 8,
  flexWrap: "wrap",
});

export const threadCode = style({
  fontFamily: fontDisplay,
  fontSize: 14.5,
  fontWeight: 700,
  color: colorTextHeading,
});

export const threadName = style({
  fontSize: 13,
  fontWeight: 600,
  color: colorTextBody,
});

export const threadTime = style({
  marginLeft: "auto",
  fontSize: 11,
  color: colorTextMuted,
  whiteSpace: "nowrap",
});

/// One line, clipped. The drawer is two taps away and holds the rest.
export const threadPreview = style({
  margin: "4px 0 0",
  fontSize: 12.5,
  lineHeight: 1.5,
  color: colorTextMuted,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const threadPreviewUnread = style({
  color: colorTextHeading,
  fontWeight: 600,
});

export const unreadCount = style({
  minWidth: 22,
  height: 22,
  padding: "0 7px",
  borderRadius: radiusPill,
  backgroundColor: colorPrimaryDeep,
  color: colorSurface,
  fontSize: 11.5,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
});

// ------------------------------------------------------------------ drawer

export const drawerShell = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

export const drawerMeta = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 20px",
  borderBottom: `1px solid ${colorBorderSoft}`,
  fontSize: 12.5,
  color: colorTextMuted,
  flexWrap: "wrap",
});

export const drawerLink = style({
  color: colorPrimaryDeep,
  fontWeight: 700,
  textDecoration: "none",
});
