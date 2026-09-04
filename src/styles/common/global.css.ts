import { globalStyle, style, keyframes } from "@vanilla-extract/css";
import {
  colorBorder,
  colorCanvas,
  colorEspresso,
  colorPrimary,
  colorSurface,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  fontBody,
  fontDisplay,
  radiusMd,
  radiusPill,
} from "./vars.css";

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("html, body, #root", {
  height: "100%",
  margin: 0,
  padding: 0,
});

globalStyle("body", {
  fontFamily: fontBody,
  color: colorTextBody,
  backgroundColor: colorCanvas,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  // The PWA runs full-bleed on iOS; without this the rubber-band scroll shows
  // the browser's white ground under the cream canvas.
  overscrollBehaviorY: "none",
});

globalStyle("#root", {
  isolation: "isolate",
});

/// A cream page needs the scrollbar toned down or it reads as a grey stripe.
globalStyle("::-webkit-scrollbar", { width: 10, height: 10 });
globalStyle("::-webkit-scrollbar-track", { background: "transparent" });
globalStyle("::-webkit-scrollbar-thumb", {
  background: colorBorder,
  borderRadius: radiusPill,
  border: "3px solid transparent",
  backgroundClip: "content-box",
});

// ------------------------------------------------------------ antd overrides

globalStyle(".ant-typography, .ant-btn, .ant-input, .ant-select, .ant-form-item-label > label", {
  fontFamily: fontBody,
});

globalStyle(".ant-btn", {
  fontWeight: 600,
  boxShadow: "none",
});

globalStyle(".ant-btn-primary", {
  color: colorEspresso,
});

globalStyle(".ant-modal-content, .ant-drawer-content", {
  backgroundColor: colorSurface,
});

globalStyle(".ant-drawer-body", {
  padding: 0,
});

globalStyle(".ant-segmented", {
  backgroundColor: "transparent",
  padding: 0,
  gap: 8,
});

globalStyle(".ant-segmented-item", {
  borderRadius: radiusMd,
  border: `1px solid ${colorBorder}`,
  backgroundColor: colorSurface,
  transition: "border-color .18s ease, box-shadow .18s ease",
});

globalStyle(".ant-segmented-item-selected", {
  borderColor: colorPrimary,
  boxShadow: "none",
});

globalStyle(".ant-segmented .ant-segmented-thumb", {
  borderRadius: radiusMd,
});

globalStyle(".ant-empty-description", {
  color: colorTextMuted,
});

globalStyle(".ant-table-thead > tr > th", {
  fontWeight: 600,
  color: colorTextHeading,
});

// ------------------------------------------------------------ shared pieces

export const fadeUp = keyframes({
  from: { opacity: 0, transform: "translateY(10px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.35 },
});

export const appRoot = style({
  minHeight: "100%",
  backgroundColor: colorCanvas,
  fontFamily: fontBody,
});

export const displayText = style({
  fontFamily: fontDisplay,
  color: colorTextHeading,
  letterSpacing: "-0.01em",
  margin: 0,
});

export const mutedText = style({
  color: colorTextMuted,
  fontSize: 13,
  lineHeight: 1.5,
});

/// Screen-reader-only, for the icon buttons that carry no visible label.
export const visuallyHidden = style({
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});
