import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorCanvasDeep,
  colorEspresso,
  colorOnEspresso,
  colorPrimarySoft,
  colorSurface,
  colorSurfaceAlt,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  radiusMd,
  radiusPill,
  radiusSm,
} from "./vars.css";
import { easeOut, typingBlink } from "./motion.css";

/// The conversation, shared by the customer's tracker and the staff drawer.
/// One sheet because it is one component — only the side a bubble sits on
/// changes.

export const thread = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "16px 14px",
  overflowY: "auto",
  // Anchored to the bottom so a new message pushes the thread up rather than
  // appearing below the fold.
  overflowAnchor: "auto",
  scrollBehavior: "smooth",
  "@media": {
    "(prefers-reduced-motion: reduce)": { scrollBehavior: "auto" },
  },
});

export const row = style({
  display: "flex",
  flexDirection: "column",
  maxWidth: "82%",
});

export const rowMine = style({
  alignSelf: "flex-end",
  alignItems: "flex-end",
});

export const rowTheirs = style({
  alignSelf: "flex-start",
  alignItems: "flex-start",
});

export const author = style({
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  color: colorTextMuted,
  margin: "0 4px 4px",
});

export const message = style({
  padding: "9px 13px",
  fontSize: 13.5,
  lineHeight: 1.55,
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
  borderRadius: radiusMd,
});

/// The customer's own words on their screen, and the shop's own on theirs.
/// Espresso rather than the brand amber: amber is the app's "do this next"
/// colour and a sent message is not an action.
export const messageMine = style({
  backgroundColor: colorEspresso,
  color: colorOnEspresso,
  borderBottomRightRadius: radiusSm,
});

export const messageTheirs = style({
  backgroundColor: colorSurfaceAlt,
  color: colorTextBody,
  border: `1px solid ${colorBorderSoft}`,
  borderBottomLeftRadius: radiusSm,
});

export const stamp = style({
  fontSize: 10.5,
  color: colorTextMuted,
  margin: "4px 6px 0",
  fontVariantNumeric: "tabular-nums",
});

/// A date rule between days, so a thread reopened tomorrow does not read as one
/// long conversation.
export const daySplit = style({
  alignSelf: "center",
  padding: "3px 12px",
  margin: "6px 0",
  borderRadius: radiusPill,
  backgroundColor: colorCanvasDeep,
  color: colorTextMuted,
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
});

export const empty = style({
  margin: "auto",
  padding: "28px 20px",
  textAlign: "center",
  fontSize: 12.5,
  lineHeight: 1.6,
  color: colorTextMuted,
});

/// Three dots while a message is in flight. Cheaper than a spinner and it says
/// the same thing in the language the rest of the screen is already speaking.
export const typing = style({
  display: "inline-flex",
  gap: 4,
  alignSelf: "flex-end",
  padding: "10px 14px",
  borderRadius: radiusMd,
  backgroundColor: colorEspresso,
  borderBottomRightRadius: radiusSm,
});

export const typingDot = style({
  width: 5,
  height: 5,
  borderRadius: "50%",
  backgroundColor: colorOnEspresso,
  animation: `${typingBlink} 1.1s ${easeOut} infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none", opacity: 0.6 },
  },
});

// ---------------------------------------------------------------- composer

export const composer = style({
  display: "flex",
  alignItems: "flex-end",
  gap: 8,
  padding: "10px 12px",
  borderTop: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
});

globalStyle(`${composer} .ant-input`, {
  borderRadius: radiusMd,
  resize: "none",
});

export const sendButton = style({
  display: "grid",
  placeItems: "center",
  width: 40,
  height: 40,
  flexShrink: 0,
  border: "none",
  borderRadius: radiusPill,
  backgroundColor: colorEspresso,
  color: colorOnEspresso,
  fontSize: 15,
  cursor: "pointer",
  transition: `transform 160ms ${easeOut}, opacity 160ms ${easeOut}`,
  selectors: {
    "&:active:not(:disabled)": { transform: "scale(0.92)" },
    "&:disabled": { opacity: 0.35, cursor: "not-allowed" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

export const closedNote = style({
  padding: "12px 14px",
  borderTop: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurfaceAlt,
  color: colorTextMuted,
  fontSize: 12,
  textAlign: "center",
});

// ------------------------------------------------------- customer's panel

export const panel = style({
  marginTop: 16,
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusMd,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const panelHead = style({
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "13px 16px",
  borderBottom: `1px solid ${colorBorderSoft}`,
});

export const panelTitle = style({
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: colorTextHeading,
});

export const liveDot = style({
  width: 7,
  height: 7,
  borderRadius: "50%",
  backgroundColor: "#3F8F5B",
  marginLeft: "auto",
});

export const unreadPip = style({
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: radiusPill,
  backgroundColor: colorPrimarySoft,
  color: colorTextHeading,
  fontSize: 10.5,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
});

// ------------------------------------------------------------ order rules

/// A conversation now spans orders on both sides, so a run of messages says
/// which one it belonged to. Squarer and quieter than daySplit deliberately:
/// two pills of equal weight between the same two bubbles would read as one
/// broken divider rather than two facts.
export const orderSplit = style({
  alignSelf: "center",
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  margin: "10px 0 2px",
  color: colorTextMuted,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  selectors: {
    "&::before, &::after": {
      content: '""',
      flex: 1,
      height: 1,
      backgroundColor: colorBorderSoft,
    },
  },
});
