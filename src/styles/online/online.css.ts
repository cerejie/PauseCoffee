import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvasDeep,
  colorDanger,
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
  radiusSm,
  shadowSoft,
} from "../common/vars.css";

/// The online checkout. It asks for more than the counter does — a number, a
/// place, a payment and proof of it — so the sheet's job is to make a long form
/// feel like four short ones.

// ------------------------------------------------------------------ banners

export const channelChip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 11px",
  borderRadius: radiusPill,
  backgroundColor: colorPrimarySoft,
  color: colorPrimaryDeep,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
});

/// The shop is shut. Loud on purpose — someone who scrolls past this and pays
/// anyway has wasted a real transfer.
export const closedBanner = style({
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "14px 16px",
  margin: "0 0 18px",
  borderRadius: radiusMd,
  backgroundColor: "#F8E0DC",
  color: "#8E3120",
  fontSize: 13,
  lineHeight: 1.6,
});

export const closedTitle = style({
  margin: 0,
  fontWeight: 700,
});

export const closedBody = style({
  margin: "2px 0 0",
});

// ------------------------------------------------------------------ section

/// One question per block, with its own heading, so the form reads as steps
/// rather than as a wall of inputs.
export const section = style({
  paddingTop: 18,
  marginTop: 18,
  borderTop: `1px solid ${colorBorderSoft}`,
  selectors: {
    "&:first-of-type": {
      paddingTop: 0,
      marginTop: 0,
      borderTop: "none",
    },
  },
});

export const sectionTitle = style({
  margin: "0 0 2px",
  fontFamily: fontDisplay,
  fontSize: 15,
  fontWeight: 700,
  color: colorTextHeading,
});

export const sectionHint = style({
  margin: "0 0 12px",
  fontSize: 12,
  lineHeight: 1.6,
  color: colorTextMuted,
});

export const fieldPair = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0 12px",
  "@media": {
    "screen and (max-width: 560px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },
});

// ----------------------------------------------------------------- payment

export const methodRow = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 14,
});

export const methodTile = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 2,
  padding: "11px 14px",
  borderRadius: radiusSm,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  color: colorTextBody,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
  transition: "border-color 140ms ease, background-color 140ms ease",
});

export const methodTileActive = style({
  borderColor: colorPrimary,
  backgroundColor: colorPrimarySoft,
  color: colorPrimaryDeep,
});

export const methodTileSub = style({
  fontSize: 11,
  fontWeight: 500,
  color: colorTextMuted,
});

/// The QR and the account it belongs to, side by side — a customer should be
/// able to check the name before they send anything.
export const qrPanel = style({
  display: "flex",
  gap: 16,
  alignItems: "center",
  padding: 14,
  borderRadius: radiusMd,
  backgroundColor: colorSurfaceAlt,
  border: `1px solid ${colorBorderSoft}`,
  marginBottom: 14,
  "@media": {
    "screen and (max-width: 480px)": {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
});

export const qrImage = style({
  width: 132,
  height: 132,
  flexShrink: 0,
  borderRadius: radiusSm,
  objectFit: "contain",
  // White ground: a QR on a cream tile is a QR some scanners will not read.
  backgroundColor: "#FFFFFF",
  border: `1px solid ${colorBorderSoft}`,
  alignSelf: "center",
});

export const qrMeta = style({
  minWidth: 0,
  fontSize: 12.5,
  lineHeight: 1.7,
  color: colorTextBody,
});

export const qrMetaLabel = style({
  display: "block",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: colorTextMuted,
});

export const qrMetaValue = style({
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  color: colorTextHeading,
  marginBottom: 8,
  wordBreak: "break-word",
});

export const amountDue = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 14px",
  borderRadius: radiusSm,
  backgroundColor: colorPrimarySoft,
  color: colorPrimaryDeep,
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 14,
});

export const amountDueValue = style({
  fontFamily: fontDisplay,
  fontSize: 19,
  fontWeight: 700,
});

// ------------------------------------------------------------- proof upload

export const proofTile = style({
  position: "relative",
  width: "100%",
  minHeight: 132,
  borderRadius: radiusMd,
  overflow: "hidden",
  backgroundColor: colorSurfaceAlt,
  border: `1px dashed ${colorPrimary}`,
  color: colorPrimaryDeep,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  padding: 16,
});

export const proofTileFilled = style({
  borderStyle: "solid",
  borderColor: colorBorderSoft,
  backgroundColor: colorSurface,
  padding: 0,
});

export const proofPlaceholder = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  fontSize: 12.5,
  fontWeight: 600,
  textAlign: "center",
});

export const proofPreview = style({
  width: "100%",
  maxHeight: 260,
  objectFit: "contain",
  display: "block",
  backgroundColor: "#FFFFFF",
});

export const proofDone = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#307145",
  backgroundColor: "#DFF1E4",
});

export const proofActions = style({
  display: "flex",
  gap: 8,
  marginTop: 10,
});

globalStyle(`${proofActions} .ant-btn`, {
  borderRadius: radiusSm,
});

export const proofMissing = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 10,
  fontSize: 12,
  fontWeight: 600,
  color: colorDanger,
});

// -------------------------------------------------------------------- misc

export const contactCard = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 14px",
  borderRadius: radiusSm,
  backgroundColor: colorCanvasDeep,
  fontSize: 12.5,
  color: colorTextBody,
  marginTop: 14,
});

export const contactLink = style({
  fontWeight: 700,
  color: colorPrimaryDeep,
  textDecoration: "none",
});

export const noticeCard = style({
  padding: "18px 20px",
  borderRadius: radiusMd,
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  boxShadow: shadowSoft,
  textAlign: "center",
});
