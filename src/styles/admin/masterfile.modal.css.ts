import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorCanvasDeep,
  colorPrimary,
  colorPrimaryDeep,
  colorPrimarySoft,
  colorSurface,
  colorSurfaceAlt,
  colorSurfaceVeil,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusMd,
  radiusPill,
  radiusSm,
} from "../common/vars.css";

/// The masterfile form modals. antd draws the chrome; this sheet decides the
/// rhythm — one header treatment, one field gap, one section rule, one footer
/// — so the item, category, size and add-on forms cannot drift apart.
///
/// A Modal portals to <body>, outside the root that carries the style
/// contract, so `FormModal` re-assigns the brand vars on `.ant-modal` itself.
/// Every rule below sits under that element and therefore resolves.
export const modalShell = style({});

globalStyle(`${modalShell} .ant-modal-content`, {
  padding: "26px 28px 22px",
  borderRadius: 24,
  backgroundColor: colorSurface,
});

/// The round close button in the corner of the mock — antd's own, given a
/// target big enough to hit on a counter tablet.
globalStyle(`${modalShell} .ant-modal-close`, {
  top: 22,
  insetInlineEnd: 24,
  width: 38,
  height: 38,
  borderRadius: radiusPill,
  backgroundColor: colorSurfaceAlt,
  color: colorTextHeading,
});

globalStyle(`${modalShell} .ant-modal-close:hover`, {
  backgroundColor: colorCanvasDeep,
  color: colorTextHeading,
});

// ------------------------------------------------------------------- header

export const head = style({
  paddingRight: 52,
  marginBottom: 22,
});

export const headTitle = style({
  margin: 0,
  fontFamily: fontDisplay,
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  color: colorTextHeading,
});

export const headSubtitle = style({
  margin: "6px 0 0",
  fontSize: 13,
  lineHeight: 1.5,
  color: colorTextMuted,
});

// ------------------------------------------------------------------- fields

/// Labels carry the weight in the mock; the gap between fields is the same
/// everywhere so nothing has to be spaced by hand per form.
globalStyle(`${modalShell} .ant-form-item`, {
  marginBottom: 18,
});

globalStyle(`${modalShell} .ant-form-item-label`, {
  paddingBottom: 6,
});

globalStyle(`${modalShell} .ant-form-item-label > label`, {
  fontSize: 13.5,
  fontWeight: 600,
  color: colorTextHeading,
});

globalStyle(`${modalShell} .ant-form-item-extra`, {
  marginTop: 6,
  fontSize: 11.5,
  lineHeight: 1.5,
  color: colorTextMuted,
});

/// "(optional)" beside a label — same line, none of the emphasis.
export const labelHint = style({
  fontWeight: 400,
  color: colorTextMuted,
});

// ------------------------------------------------------------------ section

/// A ruled break with its own heading, for the part of a form that is a list
/// rather than a field — sizes and prices on the item form.
export const section = style({
  marginTop: 4,
  paddingTop: 22,
  borderTop: `1px solid ${colorBorderSoft}`,
});

export const sectionHead = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 16,
});

export const sectionTitle = style({
  margin: 0,
  fontFamily: fontDisplay,
  fontSize: 18,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: colorTextHeading,
});

export const sectionHint = style({
  fontSize: 12.5,
  color: colorTextMuted,
});

// -------------------------------------------------------------- size rows

export const sizeRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) 40px",
  gap: 10,
  alignItems: "start",
  marginBottom: 10,
});

export const addRowButton = style({});

globalStyle(`${addRowButton}.ant-btn`, {
  height: 46,
  borderRadius: radiusMd,
  borderStyle: "dashed",
  borderColor: colorPrimary,
  color: colorPrimaryDeep,
  fontWeight: 600,
  background: "transparent",
});

globalStyle(`${addRowButton}.ant-btn:not(:disabled):hover`, {
  borderColor: colorPrimaryDeep,
  color: colorPrimaryDeep,
  background: colorPrimarySoft,
});

// -------------------------------------------------------------------- photo

/// The photo column of the item form: a square tile, its two actions, and the
/// two lines of guidance that stop a barista uploading a 12MP portrait.
export const photoTile = style({
  position: "relative",
  width: 168,
  height: 168,
  borderRadius: radiusMd,
  overflow: "hidden",
  backgroundColor: colorSurfaceAlt,
  border: `1px solid ${colorBorderSoft}`,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
});

export const photoTileEmpty = style({
  borderStyle: "dashed",
  borderColor: colorPrimary,
  color: colorPrimaryDeep,
  backgroundColor: colorPrimarySoft,
});

export const photoPlaceholder = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  fontSize: 12.5,
  fontWeight: 600,
  textAlign: "center",
  padding: "0 14px",
});

export const photoPreview = style({
  position: "absolute",
  inset: 0,
});

/// The pencil badge from the mock. Decoration on a tile that is already the
/// click target, so it never takes the tab stop.
export const photoBadge = style({
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

export const photoActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
});

globalStyle(`${photoActions} .ant-btn`, {
  borderRadius: radiusSm,
});

export const photoHint = style({
  margin: "10px 0 0",
  fontSize: 11.5,
  lineHeight: 1.6,
  color: colorTextMuted,
});

// ------------------------------------------------------------------- footer

export const footer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 24,
  paddingTop: 18,
  borderTop: `1px solid ${colorBorderSoft}`,
});

globalStyle(`${footer} .ant-btn`, {
  minWidth: 108,
  borderRadius: radiusMd,
  fontWeight: 600,
});
