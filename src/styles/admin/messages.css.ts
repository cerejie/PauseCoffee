import { style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorCanvas,
  colorEspresso,
  colorOnEspresso,
  colorPrimary,
  colorPrimaryDeep,
  colorPrimarySoft,
  colorSurface,
  colorSurfaceAlt,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusMd,
  radiusPill,
  shadowSoft,
} from "../common/vars.css";
import { easeOut } from "../common/motion.css";

/// The message inbox, laid out the way every messaging app already taught the
/// shop to read one: people down the left, the open conversation on the right.
/// A drawer would have been less work and worse — a reply is written while
/// scanning who else is waiting, and a drawer covers exactly that.

/// The admin shell is a sticky header over a padded main, neither of which has
/// a height to inherit, so the messenger takes its own from the viewport. The
/// numbers are that chrome: 74px of header and 62px of vertical padding on a
/// desktop, 70 and 112 on a phone, where the tab bar sits over the bottom.
export const messenger = style({
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  height: "calc(100dvh - 140px)",
  minHeight: 420,
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusMd,
  boxShadow: shadowSoft,
  overflow: "hidden",
  "@media": {
    "screen and (max-width: 900px)": {
      gridTemplateColumns: "1fr",
      height: "calc(100dvh - 186px)",
    },
  },
});

// ----------------------------------------------------------------- sidebar

export const sidebar = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflowY: "auto",
  padding: 8,
  gap: 4,
  borderRight: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorCanvas,
  "@media": {
    "screen and (max-width: 900px)": { borderRight: "none" },
  },
});

/// One column on a phone, so opening a conversation replaces the list rather
/// than squeezing it: whichever of the two is not being looked at steps out.
/// Both stay mounted — going back must not cost a refetch of a list that was
/// correct a second ago.
export const hiddenOnPhone = style({
  "@media": {
    "screen and (max-width: 900px)": { display: "none" },
  },
});

export const threadRow = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "10px 12px",
  textAlign: "left",
  background: "none",
  border: "1px solid transparent",
  borderRadius: radiusMd,
  cursor: "pointer",
  transition: `background-color 140ms ${easeOut}, border-color 140ms ${easeOut}`,
  selectors: {
    "&:hover": { backgroundColor: colorSurfaceAlt },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const threadRowActive = style({
  backgroundColor: colorPrimarySoft,
  borderColor: colorPrimary,
  selectors: {
    "&:hover": { backgroundColor: colorPrimarySoft },
  },
});

/// The monogram. A conversation is a person now, and a person is easier to
/// find by the shape of their initials than by reading three names.
export const avatar = style({
  width: 40,
  height: 40,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  borderRadius: radiusPill,
  backgroundColor: colorEspresso,
  color: colorOnEspresso,
  fontFamily: fontDisplay,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.02em",
});

export const avatarUnread = style({
  backgroundColor: colorPrimaryDeep,
});

// A row is a <button>, which may only hold phrasing content, so every part of
// it is a <span> given its box by these rules rather than by its tag.
export const threadBody = style({
  display: "block",
  flex: 1,
  minWidth: 0,
});

export const threadHead = style({
  display: "flex",
  alignItems: "baseline",
  gap: 8,
});

export const threadName = style({
  fontSize: 13.5,
  fontWeight: 600,
  color: colorTextHeading,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const threadTime = style({
  marginLeft: "auto",
  fontSize: 11,
  color: colorTextMuted,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

/// One line, clipped. The conversation itself is one tap away and holds the rest.
export const threadPreview = style({
  display: "block",
  margin: "3px 0 0",
  fontSize: 12.5,
  lineHeight: 1.45,
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
  minWidth: 20,
  height: 20,
  padding: "0 6px",
  borderRadius: radiusPill,
  backgroundColor: colorPrimaryDeep,
  color: colorSurface,
  fontSize: 11,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
});

// -------------------------------------------------------------------- pane

export const pane = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  backgroundColor: colorSurface,
});

export const paneHead = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  borderBottom: `1px solid ${colorBorderSoft}`,
});

/// Phones only — the list it goes back to is the whole screen there, and on a
/// desktop it is still on the left where it never went away.
export const paneBack = style({
  display: "none",
  "@media": {
    "screen and (max-width: 900px)": {
      display: "grid",
      placeItems: "center",
      width: 34,
      height: 34,
      flexShrink: 0,
      border: "none",
      borderRadius: radiusPill,
      backgroundColor: colorSurfaceAlt,
      color: colorTextHeading,
      fontSize: 14,
      cursor: "pointer",
    },
  },
});

export const paneIdentity = style({
  minWidth: 0,
  flex: 1,
});

export const paneName = style({
  margin: 0,
  fontFamily: fontDisplay,
  fontSize: 16,
  fontWeight: 600,
  color: colorTextHeading,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const paneSub = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 2,
  fontSize: 12,
  color: colorTextMuted,
});

export const paneLink = style({
  color: colorPrimaryDeep,
  fontWeight: 700,
  textDecoration: "none",
});

/// Which ticket the reply will be filed against. Worth saying out loud once
/// the customer has more than one, because the shop is answering a person and
/// the database is still filing against an order.
export const replyNote = style({
  padding: "7px 16px",
  borderTop: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurfaceAlt,
  fontSize: 11.5,
  color: colorTextMuted,
});

export const paneEmpty = style({
  display: "grid",
  placeItems: "center",
  height: "100%",
  padding: 24,
  color: colorTextBody,
});
