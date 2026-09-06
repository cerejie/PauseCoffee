import { style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorCanvasDeep,
  colorDanger,
  colorEspresso,
  colorPrimarySoft,
  colorSuccess,
  colorSurfaceAlt,
  colorTextHeading,
  colorTextMuted,
  fontDisplay,
  radiusMd,
  radiusPill,
} from "../common/vars.css";

/// Shared by the confirm-email modal and the page the link lands on — one
/// feature, one stylesheet, so the two ends of the flow cannot drift apart.

export const panel = style({
  display: "grid",
  justifyItems: "center",
  gap: 14,
  textAlign: "center",
  padding: "6px 4px 2px",
});

export const badge = style({
  width: 66,
  height: 66,
  display: "grid",
  placeItems: "center",
  borderRadius: radiusPill,
  fontSize: 27,
  backgroundColor: colorPrimarySoft,
  color: colorEspresso,
});

export const badgeSuccess = style({
  backgroundColor: colorSurfaceAlt,
  color: colorSuccess,
});

export const badgeDanger = style({
  backgroundColor: colorSurfaceAlt,
  color: colorDanger,
});

export const title = style({
  margin: 0,
  fontFamily: fontDisplay,
  fontSize: 25,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  color: colorTextHeading,
});

export const copy = style({
  margin: 0,
  maxWidth: 330,
  fontSize: 13.5,
  lineHeight: 1.65,
  color: colorTextMuted,
});

export const address = style({
  display: "inline-block",
  marginTop: 2,
  padding: "6px 14px",
  borderRadius: radiusMd,
  border: `1px solid ${colorBorderSoft}`,
  backgroundColor: colorCanvasDeep,
  fontSize: 13.5,
  fontWeight: 700,
  color: colorTextHeading,
  wordBreak: "break-all",
});

/// The three-line "what happens next" under the address. Deliberately quiet —
/// the address is what the visitor is here to check.
export const steps = style({
  display: "grid",
  gap: 7,
  margin: 0,
  padding: 0,
  listStyle: "none",
  textAlign: "left",
  maxWidth: 330,
  fontSize: 12.5,
  lineHeight: 1.55,
  color: colorTextMuted,
});

export const step = style({
  display: "grid",
  gridTemplateColumns: "16px 1fr",
  gap: 8,
  alignItems: "start",
});

export const stepMark = style({
  color: colorEspresso,
  opacity: 0.55,
  fontWeight: 700,
});

export const actions = style({
  display: "grid",
  gap: 8,
  width: "100%",
  marginTop: 8,
});

export const countdown = style({
  fontSize: 12,
  color: colorTextMuted,
  opacity: 0.85,
});
