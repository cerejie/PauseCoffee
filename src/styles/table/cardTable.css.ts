import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorPrimarySoft,
  colorSurface,
  colorTextHeading,
  colorTextMuted,
  radiusMd,
} from "../common/vars.css";

/// antd Table drawn as a tinted header bar over a calm cream body — the same
/// visual language as the customer cards, so the admin app reads as one app.
export const cardTable = style({});

globalStyle(`${cardTable} .ant-table`, {
  background: "transparent",
});

globalStyle(`${cardTable} .ant-table-thead > tr > th`, {
  backgroundColor: colorPrimarySoft,
  borderBottom: "none",
  color: colorTextHeading,
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  padding: "12px 16px",
});

globalStyle(`${cardTable} .ant-table-thead > tr > th::before`, {
  display: "none",
});

globalStyle(`${cardTable} .ant-table-tbody > tr > td`, {
  borderBottom: `1px solid ${colorBorderSoft}`,
  padding: "14px 16px",
  backgroundColor: colorSurface,
});

globalStyle(`${cardTable} .ant-table-tbody > tr:hover > td`, {
  backgroundColor: colorPrimarySoft,
});

globalStyle(`${cardTable} .ant-pagination`, {
  padding: "0 16px",
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
  borderRadius: radiusMd,
  fontSize: 11.5,
  fontWeight: 700,
  lineHeight: "18px",
  border: "1px solid currentColor",
});

export const statusDot = style({
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: "currentColor",
});
