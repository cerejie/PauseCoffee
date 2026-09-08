import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorPrimary,
  colorPrimaryDeep,
  colorPrimarySoft,
  colorSurface,
  colorSurfaceAlt,
  colorSurfaceVeil,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusMd,
  radiusPill,
  radiusSm,
  shadowSoft,
} from "../common/vars.css";

/// The Settings screen. Each tab is a stack of panels, and a panel is one
/// decision with its own explanation and its own Save — the shop should be able
/// to change the QR without also re-confirming its opening hours.

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: 18,
  maxWidth: 760,
});

export const panel = style({
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusMd,
  boxShadow: shadowSoft,
  padding: "20px 22px 18px",
});

export const panelHead = style({
  marginBottom: 18,
});

export const panelTitle = style({
  margin: 0,
  fontFamily: fontDisplay,
  fontSize: 17,
  fontWeight: 700,
  color: colorTextHeading,
});

export const panelHint = style({
  margin: "6px 0 0",
  fontSize: 12.5,
  lineHeight: 1.65,
  color: colorTextMuted,
});

/// Two columns on a desktop, one on a phone. The admin app is used on both —
/// the owner sets the QR at a laptop, and flips the shop closed from a phone.
export const fieldGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0 16px",
  "@media": {
    "screen and (max-width: 640px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },
});

export const fieldFull = style({
  gridColumn: "1 / -1",
});

export const fieldLabel = style({
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.01em",
  color: colorTextHeading,
});

/// The kill switch and the two method toggles. The control sits beside its
/// explanation rather than under it, so the state reads at a glance.
export const toggleRow = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 16px",
  backgroundColor: colorSurfaceAlt,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusSm,
  marginBottom: 16,
});

export const toggleCopy = style({
  minWidth: 0,
});

export const toggleTitle = style({
  margin: 0,
  fontSize: 13.5,
  fontWeight: 700,
  color: colorTextHeading,
});

export const toggleHint = style({
  margin: "4px 0 0",
  fontSize: 12,
  lineHeight: 1.6,
  color: colorTextMuted,
});

/// Shown under the switch when the shop is on but the clock has it shut — the
/// state the owner is most likely to misread as "my kill switch is broken".
export const statusNote = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: radiusSm,
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 16,
});

export const statusNoteOpen = style({
  backgroundColor: "#DFF1E4",
  color: "#307145",
});

export const statusNoteShut = style({
  backgroundColor: "#F8E0DC",
  color: "#B0402C",
});

export const divider = style({
  height: 1,
  backgroundColor: colorBorderSoft,
  margin: "4px 0 20px",
});

// -------------------------------------------------------------------- the QR

export const qrLayout = style({
  display: "flex",
  gap: 20,
  alignItems: "flex-start",
  flexWrap: "wrap",
});

/// Deliberately larger than the product photo tile: this is the one image in
/// the app whose job is to be scanned, and the owner has to be able to see
/// that the right code is loaded without opening it.
export const qrTile = style({
  position: "relative",
  width: 208,
  height: 208,
  borderRadius: radiusMd,
  overflow: "hidden",
  backgroundColor: colorSurfaceAlt,
  border: `1px solid ${colorBorderSoft}`,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  flexShrink: 0,
});

export const qrTileEmpty = style({
  borderStyle: "dashed",
  borderColor: colorPrimary,
  color: colorPrimaryDeep,
  backgroundColor: colorPrimarySoft,
});

export const qrPlaceholder = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  fontSize: 12.5,
  fontWeight: 600,
  textAlign: "center",
  padding: "0 16px",
});

export const qrPreview = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundColor: "#FFFFFF",
});

export const qrBadge = style({
  position: "absolute",
  top: 10,
  right: 10,
  width: 34,
  height: 34,
  borderRadius: radiusPill,
  backgroundColor: colorSurfaceVeil,
  color: colorTextHeading,
  display: "grid",
  placeItems: "center",
  fontSize: 14,
});

export const qrSide = style({
  flex: "1 1 240px",
  minWidth: 0,
});

export const qrHint = style({
  margin: "0 0 12px",
  fontSize: 12.5,
  lineHeight: 1.7,
  color: colorTextBody,
});

export const qrActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
});

globalStyle(`${qrActions} .ant-btn`, {
  borderRadius: radiusSm,
});

// ------------------------------------------------------------------- footer

export const footer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 8,
  paddingTop: 16,
  borderTop: `1px solid ${colorBorderSoft}`,
});

globalStyle(`${footer} .ant-btn`, {
  borderRadius: radiusSm,
});
