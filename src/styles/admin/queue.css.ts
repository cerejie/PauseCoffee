import { style, keyframes } from "@vanilla-extract/css";
import {
  accent,
  accentSoft,
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
  radiusSm,
  shadowSoft,
} from "../common/vars.css";

const slideIn = keyframes({
  from: { opacity: 0, transform: "translateY(-8px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const board = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
  alignItems: "start",
  "@media": {
    "screen and (max-width: 1100px)": {
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    },
  },
});

export const column = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const columnHead = style({
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "10px 14px",
  borderRadius: radiusMd,
  backgroundColor: accentSoft,
  marginBottom: 10,
  position: "sticky",
  top: 66,
  zIndex: 5,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
});

export const columnDot = style({
  width: 8,
  height: 8,
  borderRadius: radiusPill,
  backgroundColor: accent,
});

export const columnTitle = style({
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: colorTextHeading,
});

export const columnCount = style({
  marginLeft: "auto",
  minWidth: 22,
  height: 22,
  padding: "0 7px",
  borderRadius: radiusPill,
  backgroundColor: accent,
  color: colorSurface,
  fontSize: 11.5,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
});

export const columnBody = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minHeight: 120,
});

// --------------------------------------------------------------------- ticket

export const ticket = style({
  position: "relative",
  borderRadius: radiusLg,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
  overflow: "hidden",
  animation: `${slideIn} .25s ease`,
});

export const ticketHead = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  padding: "13px 15px 11px",
  borderBottom: `1px dashed ${colorBorder}`,
});

export const ticketCode = style({
  fontFamily: fontDisplay,
  fontSize: 19,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
});

export const ticketName = style({
  fontSize: 13,
  color: colorTextBody,
  marginTop: 4,
  fontWeight: 500,
});

export const ticketTypeChip = style({
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "3px 8px",
  borderRadius: radiusPill,
  backgroundColor: colorSurfaceAlt,
  color: colorTextMuted,
  whiteSpace: "nowrap",
});

export const ticketTimer = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 11.5,
  fontWeight: 600,
  color: colorTextMuted,
  marginTop: 6,
  fontVariantNumeric: "tabular-nums",
});

/// A ticket waiting more than ten minutes turns red — the whole point of the
/// board is that nobody's drink goes quiet.
export const ticketTimerLate = style({
  color: colorDanger,
});

export const ticketItems = style({
  padding: "10px 15px",
  display: "flex",
  flexDirection: "column",
  gap: 9,
  maxHeight: 260,
  overflowY: "auto",
});

export const ticketItem = style({
  display: "flex",
  gap: 10,
});

export const ticketQty = style({
  minWidth: 24,
  height: 22,
  borderRadius: radiusSm,
  backgroundColor: colorEspresso,
  color: "#F7EFE3",
  fontSize: 11.5,
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
});

export const ticketItemBody = style({
  flex: 1,
  minWidth: 0,
});

export const ticketItemName = style({
  fontSize: 13.5,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1.3,
});

export const ticketItemMeta = style({
  fontSize: 11.5,
  color: colorTextMuted,
  marginTop: 2,
  lineHeight: 1.45,
});

export const ticketItemNote = style({
  fontSize: 11.5,
  color: colorDanger,
  fontWeight: 600,
  marginTop: 3,
});

export const ticketNote = style({
  margin: "0 15px 10px",
  padding: "8px 11px",
  borderRadius: radiusSm,
  backgroundColor: colorSurfaceAlt,
  fontSize: 12,
  color: colorTextBody,
  fontStyle: "italic",
});

export const ticketFooter = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 15px",
  borderTop: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurfaceAlt,
});

export const ticketTotal = style({
  fontSize: 13.5,
  fontWeight: 700,
  color: colorTextHeading,
  marginRight: "auto",
});

export const advanceButton = style({
  height: 36,
  padding: "0 15px",
  borderRadius: radiusPill,
  border: "none",
  backgroundColor: colorPrimary,
  color: colorEspresso,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  transition: "filter .16s ease",
  selectors: {
    "&:hover:not(:disabled)": { filter: "brightness(1.05)" },
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
  },
});

export const cancelButton = style({
  width: 36,
  height: 36,
  borderRadius: radiusPill,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  color: colorTextMuted,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition: "all .16s ease",
  selectors: {
    "&:hover": { borderColor: colorDanger, color: colorDanger },
  },
});

export const columnEmpty = style({
  padding: "34px 16px",
  textAlign: "center",
  borderRadius: radiusMd,
  border: `1px dashed ${colorBorder}`,
  backgroundColor: colorCanvasDeep,
  fontSize: 12.5,
  color: colorTextMuted,
});

// ----------------------------------------------------------------- stat tiles

export const statRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginBottom: 18,
});

export const statTile = style({
  padding: "15px 17px",
  borderRadius: radiusMd,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  boxShadow: shadowSoft,
});

export const statLabel = style({
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const statValue = style({
  fontFamily: fontDisplay,
  fontSize: 27,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1.1,
  marginTop: 6,
  fontVariantNumeric: "tabular-nums",
});

export const statHint = style({
  fontSize: 11.5,
  color: colorTextMuted,
  marginTop: 3,
});
