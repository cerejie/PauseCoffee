import { keyframes, style } from "@vanilla-extract/css";
import {
  colorCanvas,
  colorEspresso,
  colorPrimary,
  colorTextMuted,
  radiusPill,
} from "./vars.css";

const steam = keyframes({
  "0%, 100%": { transform: "scaleY(0.55)", opacity: 0.4 },
  "50%": { transform: "scaleY(1)", opacity: 1 },
});

export const loaderWrap = style({
  display: "grid",
  placeItems: "center",
  gap: 14,
  padding: 40,
});

export const loaderFullscreen = style({
  minHeight: "100dvh",
  backgroundColor: colorCanvas,
});

export const loaderRoundel = style({
  width: 46,
  height: 46,
  borderRadius: radiusPill,
  backgroundColor: colorPrimary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
});

export const loaderBar = style({
  width: 5,
  height: 20,
  borderRadius: 3,
  backgroundColor: colorEspresso,
  animation: `${steam} 1.1s ease-in-out infinite`,
});

export const loaderBarDelayed = style({
  animationDelay: "0.28s",
});

export const loaderLabel = style({
  fontSize: 13,
  color: colorTextMuted,
  letterSpacing: "0.04em",
});
