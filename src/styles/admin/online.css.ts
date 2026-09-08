import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvasDeep,
  colorDanger,
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
  radiusSm,
  shadowSoft,
} from "../common/vars.css";

/// The approval inbox. Every order on this screen has already been paid for by
/// somebody who is now watching a tracker, so the layout puts the two things
/// that decide the answer — the amount and the receipt — closest to the button.

export const board = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 14,
});

export const card = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 16,
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  borderRadius: radiusMd,
  boxShadow: shadowSoft,
});

export const cardHead = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
});

export const code = style({
  fontFamily: fontDisplay,
  fontSize: 16,
  fontWeight: 700,
  color: colorTextHeading,
  letterSpacing: "0.01em",
});

export const customer = style({
  fontSize: 13,
  fontWeight: 600,
  color: colorTextBody,
  marginTop: 2,
});

export const meta = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11.5,
  color: colorTextMuted,
  marginTop: 3,
});

/// Ten minutes is roughly where somebody who has just transferred money starts
/// wondering whether it went through.
export const metaLate = style({
  color: colorDanger,
  fontWeight: 700,
});

export const typeChip = style({
  padding: "3px 10px",
  borderRadius: radiusPill,
  backgroundColor: colorPrimarySoft,
  color: colorPrimaryDeep,
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

export const itemList = style({
  display: "flex",
  flexDirection: "column",
  gap: 5,
  padding: "10px 12px",
  backgroundColor: colorSurfaceAlt,
  borderRadius: radiusSm,
  fontSize: 12.5,
  color: colorTextBody,
});

export const itemRow = style({
  display: "flex",
  gap: 8,
});

export const itemQty = style({
  fontWeight: 700,
  color: colorPrimaryDeep,
  minWidth: 22,
});

export const totalRow = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
});

export const totalLabel = style({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const totalValue = style({
  fontFamily: fontDisplay,
  fontSize: 20,
  fontWeight: 700,
  color: colorTextHeading,
});

export const reviewButton = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  padding: "11px 16px",
  border: "none",
  borderRadius: radiusPill,
  backgroundColor: colorTextHeading,
  color: colorSurface,
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
});

// ------------------------------------------------------------------ drawer

export const drawerBody = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: "20px 22px 24px",
});

export const block = style({
  display: "flex",
  flexDirection: "column",
  gap: 6,
});

export const blockLabel = style({
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const blockValue = style({
  fontSize: 14,
  fontWeight: 600,
  color: colorTextHeading,
  wordBreak: "break-word",
});

export const detailGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
});

/// The receipt, as large as the drawer allows. This is the evidence — a
/// thumbnail would mean approving payments nobody has actually read.
export const receiptFrame = style({
  position: "relative",
  borderRadius: radiusSm,
  overflow: "hidden",
  border: `1px solid ${colorBorder}`,
  backgroundColor: "#FFFFFF",
  minHeight: 200,
  display: "grid",
  placeItems: "center",
});

export const receiptImage = style({
  width: "100%",
  maxHeight: 420,
  objectFit: "contain",
  display: "block",
  cursor: "zoom-in",
});

export const receiptMissing = style({
  padding: 24,
  textAlign: "center",
  fontSize: 12.5,
  color: colorTextMuted,
});

export const mapLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "8px 14px",
  borderRadius: radiusSm,
  backgroundColor: colorCanvasDeep,
  color: colorPrimaryDeep,
  fontSize: 12.5,
  fontWeight: 700,
  textDecoration: "none",
  alignSelf: "flex-start",
});

export const drawerFooter = style({
  display: "flex",
  gap: 10,
  padding: "16px 22px",
  borderTop: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorSurface,
  position: "sticky",
  bottom: 0,
});

globalStyle(`${drawerFooter} .ant-btn`, {
  flex: 1,
  borderRadius: radiusPill,
  fontWeight: 700,
});

/// The reject step opens in place rather than in a modal on top of a drawer —
/// stacked overlays on a phone are how a barista loses track of which one they
/// are answering.
export const rejectPanel = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 16,
  margin: "0 22px 16px",
  borderRadius: radiusMd,
  backgroundColor: "#F8E0DC",
  border: "1px solid #E9BFB6",
});

export const rejectTitle = style({
  margin: 0,
  fontSize: 13.5,
  fontWeight: 700,
  color: "#8E3120",
});

globalStyle(`${rejectPanel} .ant-radio-wrapper`, {
  fontSize: 12.5,
  alignItems: "flex-start",
  marginInlineEnd: 0,
  whiteSpace: "normal",
});
