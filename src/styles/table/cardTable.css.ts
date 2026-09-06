import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvas,
  colorPrimary,
  colorPrimarySoft,
  colorSurface,
  colorTextHeading,
  colorTextMuted,
  radiusMd,
  radiusSm,
} from "../common/vars.css";

/// antd Table drawn as a stack of row-cards rather than a ruled grid: the rows
/// are separated, each one carries its own border and rounded ends, and the
/// header is a tinted bar above them. Ported from the TARTAR transaction table
/// — minus its expand-to-detail mechanic, which nothing here needs.
export const cardTable = style({
  // The rows are surface-coloured cards, so the tray behind them has to be the
  // darker cream or they have nothing to sit on.
  backgroundColor: colorCanvas,
  padding: "4px 14px 14px",
});

const rowGap = "8px";
const rowBorder = `1px solid ${colorBorderSoft}`;

globalStyle(`${cardTable} .ant-table`, {
  background: "transparent",
});

globalStyle(`${cardTable} .ant-table table`, {
  borderCollapse: "separate",
  borderSpacing: `0 ${rowGap}`,
});

// ------------------------------------------------------------------- header

globalStyle(`${cardTable} .ant-table-thead > tr > th`, {
  backgroundColor: colorPrimarySoft,
  border: "none",
  color: colorTextHeading,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  padding: "10px 16px",
});

globalStyle(`${cardTable} .ant-table-thead > tr > th:first-child`, {
  borderStartStartRadius: radiusMd,
  borderEndStartRadius: radiusMd,
});

globalStyle(`${cardTable} .ant-table-thead > tr > th:last-child`, {
  borderStartEndRadius: radiusMd,
  borderEndEndRadius: radiusMd,
});

// The vertical hairline antd draws between headers fights the tinted bar.
globalStyle(`${cardTable} .ant-table-thead > tr > th::before`, {
  display: "none",
});

// --------------------------------------------------------------------- rows

globalStyle(`${cardTable} .ant-table-tbody > tr > td`, {
  backgroundColor: colorSurface,
  borderBlock: rowBorder,
  borderInline: "none",
  padding: "13px 16px",
  transition: "background-color .15s ease, border-color .15s ease",
});

globalStyle(`${cardTable} .ant-table-tbody > tr > td:first-child`, {
  borderInlineStart: rowBorder,
  borderStartStartRadius: radiusMd,
  borderEndStartRadius: radiusMd,
});

globalStyle(`${cardTable} .ant-table-tbody > tr > td:last-child`, {
  borderInlineEnd: rowBorder,
  borderStartEndRadius: radiusMd,
  borderEndEndRadius: radiusMd,
});

/// Hover lifts the whole card's outline rather than repainting its fill, so a
/// row with status colours in it does not change hue under the cursor.
globalStyle(`${cardTable} .ant-table-tbody > tr.ant-table-row:hover > td`, {
  backgroundColor: colorSurface,
  borderColor: colorPrimary,
});

// antd's zero-height sizing row would otherwise draw as an empty card.
globalStyle(`${cardTable} .ant-table-measure-row > td`, {
  background: "transparent",
  border: "none",
  padding: 0,
});

globalStyle(`${cardTable} .ant-table-placeholder > td`, {
  backgroundColor: colorSurface,
  border: rowBorder,
  borderRadius: radiusMd,
});

globalStyle(`${cardTable} .ant-table-placeholder:hover > td`, {
  backgroundColor: colorSurface,
});

// ----------------------------------------------------------- expanded rows

// Order history opens its line items under the ticket. The panel is not a card
// of its own — it belongs to the row above it, so the row loses its bottom
// rounding and the panel picks the shape up.
globalStyle(`${cardTable} .ant-table-tbody > tr.ant-table-expanded-row > td`, {
  backgroundColor: colorSurface,
  borderBlock: "none",
  borderBottom: rowBorder,
  borderInline: rowBorder,
  borderStartStartRadius: 0,
  borderStartEndRadius: 0,
  borderEndStartRadius: radiusMd,
  borderEndEndRadius: radiusMd,
  padding: "0 16px 14px",
});

globalStyle(`${cardTable} .ant-table-tbody > tr.ant-table-expanded-row:hover > td`, {
  backgroundColor: colorSurface,
});

globalStyle(`${cardTable} tr.ant-table-expanded-row > td > *`, {
  paddingTop: 12,
  borderTop: `1px dashed ${colorBorderSoft}`,
});

globalStyle(`${cardTable} .ant-table-row-expand-icon`, {
  borderColor: colorBorder,
  backgroundColor: colorSurface,
});

// --------------------------------------------------------------- furniture

globalStyle(`${cardTable} .ant-pagination`, {
  padding: "0 2px",
  marginBottom: 0,
});

globalStyle(`${cardTable} .ant-empty-description`, {
  color: colorTextMuted,
});

export const twoLineTop = style({
  fontSize: 13.5,
  fontWeight: 600,
  color: colorTextHeading,
  lineHeight: 1.3,
});

export const twoLineBottom = style({
  fontSize: 12,
  color: colorTextMuted,
  marginTop: 2,
  lineHeight: 1.4,
});

export const statusPill = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 10px",
  borderRadius: radiusSm,
  fontSize: 11.5,
  fontWeight: 700,
  lineHeight: "18px",
  border: "1px solid currentColor",
  whiteSpace: "nowrap",
});

export const statusDot = style({
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: "currentColor",
});

/// The edit/delete pair every masterfile row ends with.
export const rowActions = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  justifyContent: "flex-end",
});
