import { globalStyle, style } from "@vanilla-extract/css";
import {
  colorBorderSoft,
  colorPrimary,
  colorPrimaryDeep,
  colorSurface,
  colorTextMuted,
  radiusMd,
  radiusSm,
} from "../common/vars.css";

/// The delivery map. Leaflet ships its own stylesheet (imported once in
/// main.tsx) which draws the tiles, the zoom control and the attribution; this
/// sheet only brands the frame and replaces the marker.

export const mapFrame = style({
  position: "relative",
  height: 260,
  borderRadius: radiusMd,
  overflow: "hidden",
  border: `1px solid ${colorBorderSoft}`,
  // Leaflet paints panes at z-index 400+; without a stacking context of its
  // own the map would climb over the sticky header and the cart bar.
  isolation: "isolate",
  zIndex: 0,
});

globalStyle(`${mapFrame} .leaflet-container`, {
  height: "100%",
  width: "100%",
  // Leaflet's default is a sans stack of its own; inheriting keeps the
  // attribution line in the app's typeface.
  fontFamily: "inherit",
});

/// The attribution is not decoration — OpenStreetMap's tile policy requires
/// it. Toned down, never hidden.
globalStyle(`${mapFrame} .leaflet-control-attribution`, {
  fontSize: 9.5,
  background: "rgba(255, 253, 248, 0.86)",
});

globalStyle(`${mapFrame} .leaflet-bar a`, {
  borderRadius: 0,
});

/// A CSS pin rather than Leaflet's default PNG. Two reasons: the default icon's
/// asset URLs break under a bundler, and a marker built from the brand tokens
/// is the same amber as the rest of the app.
export const pin = style({
  width: 26,
  height: 26,
  borderRadius: "50% 50% 50% 0",
  transform: "rotate(-45deg)",
  backgroundColor: colorPrimary,
  border: `2px solid ${colorSurface}`,
  boxShadow: "0 3px 10px rgba(59, 35, 23, 0.35)",
});

export const mapActions = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
  marginTop: 10,
});

globalStyle(`${mapActions} .ant-btn`, {
  borderRadius: radiusSm,
});

export const mapHint = style({
  margin: "10px 0 0",
  fontSize: 11.5,
  lineHeight: 1.6,
  color: colorTextMuted,
});

export const coordChip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: radiusSm,
  backgroundColor: colorSurface,
  border: `1px solid ${colorBorderSoft}`,
  fontSize: 11,
  fontWeight: 600,
  color: colorPrimaryDeep,
  fontVariantNumeric: "tabular-nums",
});
