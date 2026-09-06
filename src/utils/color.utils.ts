/// Accent colours come from the admin's colour picker, so they arrive as #rgb,
/// #rgba, #rrggbb or #rrggbbaa. Reading them into channels rather than treating
/// them as strings is what keeps the derived tints honest — appending an alpha
/// pair to an 8-digit hex yields an invalid colour and the tint silently
/// vanishes.
export type Rgb = readonly [number, number, number];

const SHORT_HEX = /^#?([\da-f]{3})[\da-f]?$/i;
const LONG_HEX = /^#?([\da-f]{6})(?:[\da-f]{2})?$/i;

export const toRgb = (value: string | undefined | null): Rgb | null => {
  if (!value) return null;

  const short = SHORT_HEX.exec(value.trim());
  const hex = short
    ? short[1].replace(/./g, (channel) => channel + channel)
    : LONG_HEX.exec(value.trim())?.[1];

  if (!hex) return null;

  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
};

export const toHex = (rgb: Rgb): string =>
  `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

export const rgba = (rgb: Rgb, alpha: number): string =>
  `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

export const mix = (from: Rgb, to: Rgb, weight: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * weight),
  Math.round(from[1] + (to[1] - from[1]) * weight),
  Math.round(from[2] + (to[2] - from[2]) * weight),
];

const linear = (value: number): number => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

/// WCAG relative luminance, and the contrast ratio built on it.
export const luminance = (rgb: Rgb): number =>
  0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);

export const contrast = (a: Rgb, b: Rgb): number => {
  const first = luminance(a);
  const second = luminance(b);
  const [lighter, darker] = first > second ? [first, second] : [second, first];
  return (lighter + 0.05) / (darker + 0.05);
};

/// Nudges a colour towards `toward` only as far as it takes to read against
/// `background`. A colour that already carries text comes back untouched, so a
/// dark accent keeps its own hue and only a pale one gets deepened.
export const readableOn = (
  seed: Rgb,
  background: Rgb,
  toward: Rgb,
  target = 4.5,
): Rgb => {
  let ink = seed;

  for (let step = 0; step < 12 && contrast(ink, background) < target; step += 1) {
    ink = mix(ink, toward, 0.12);
  }

  return ink;
};
