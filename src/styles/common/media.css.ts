import { style } from "@vanilla-extract/css";
import {
  accent,
  accentInk,
  accentSoft,
  colorBorderSoft,
  colorSurfaceAlt,
  colorTextMuted,
  radiusMd,
  radiusSm,
} from "./vars.css";

/// The frame is what every caller sizes; the picture inside always fills it.
/// One shape for the card thumb, the drawer hero, the cart line and the admin
/// table means a missing photo falls back the same way in all four.
export const mediaFrame = style({
  position: "relative",
  flexShrink: 0,
  display: "block",
  overflow: "hidden",
  backgroundColor: colorSurfaceAlt,
});

export const mediaImage = style({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

/// The whole product, letterboxed inside the frame instead of cropped to it —
/// a cup shot tall enough to lose its lid and its base to `cover`.
export const mediaImageContain = style([
  mediaImage,
  {
    position: "relative",
    zIndex: 1,
    objectFit: "contain",
    boxSizing: "border-box",
    padding: "14px 16px 12px",
    filter: "drop-shadow(0 10px 20px rgba(51, 32, 15, 0.24))",
  },
]);

/// …and the same photo behind it, blown past the edges and blurred out, so the
/// band still reads as full-bleed colour rather than as a letterboxed slab.
export const mediaBackdrop = style({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: "scale(1.4)",
  filter: "blur(26px) saturate(150%)",
  opacity: 0.6,
});

/// Only ever seen on rows seeded before photography — the form requires a
/// picture, so nothing saved from the admin screen can land here.
export const mediaFallback = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  backgroundColor: accentSoft,
  color: accentInk,
});

// ---------------------------------------------------------------- callers

/// Stretched rather than square: the card is a row, so the picture taking the
/// full height of it is what keeps a two-line description from leaving a gap
/// beside the thumbnail.
export const mediaCard = style({
  alignSelf: "stretch",
  width: 94,
  minHeight: 112,
  borderRadius: radiusMd,
  fontSize: 22,
  "@media": {
    // The card is portrait on a phone, so the picture is the card's lid: full
    // width, square, and squared off — the card's own radius clips the corners.
    "screen and (max-width: 640px)": {
      width: "100%",
      minHeight: 0,
      aspectRatio: "1 / 1",
      borderRadius: 0,
      fontSize: 26,
    },
  },
});

export const mediaLine = style({
  width: 56,
  height: 56,
  borderRadius: radiusSm,
  fontSize: 16,
});

export const mediaHero = style({
  width: "100%",
  height: 212,
  borderRadius: 0,
  fontSize: 30,
  "@media": {
    // Tall enough that a contained cup still reads as the subject, short enough
    // that size and sweetness stay above the fold on the sheet below it.
    "screen and (max-width: 640px)": { height: 176 },
  },
});

export const mediaCell = style({
  width: 44,
  height: 44,
  borderRadius: radiusSm,
  border: `1px solid ${colorBorderSoft}`,
  fontSize: 15,
});

/// The admin table's item column — a thumbnail beside the two-line name cell.
export const mediaCellRow = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
});

// ------------------------------------------------------------------ upload

export const uploadTile = style({
  position: "relative",
  width: 120,
  height: 120,
  borderRadius: radiusMd,
  overflow: "hidden",
  backgroundColor: colorSurfaceAlt,
  border: `1px dashed ${colorBorderSoft}`,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  color: colorTextMuted,
  transition: "border-color .18s ease, color .18s ease",
  selectors: {
    "&:hover": { borderColor: accent, color: accent },
  },
});

export const uploadPlaceholder = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  textAlign: "center",
  padding: "0 10px",
});

export const uploadPreview = style({
  position: "absolute",
  inset: 0,
});

/// Sits over the preview so a photo already in place still reads as replaceable.
export const uploadOverlay = style({
  position: "absolute",
  insetInline: 0,
  bottom: 0,
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 600,
  textAlign: "center",
  color: "#FFFFFF",
  backgroundColor: "rgba(51, 32, 15, 0.62)",
});

export const uploadHint = style({
  marginTop: 8,
  fontSize: 11.5,
  lineHeight: 1.5,
  color: colorTextMuted,
});
