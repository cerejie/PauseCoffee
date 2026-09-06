import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useMemo } from "react";
import { brand } from "../../constants/brand.constants";
import { accent, accentInk, accentOn, accentSoft } from "../../styles/common/vars.css";
import { contrast, readableOn, rgba, toHex, toRgb } from "../../utils/color.utils";

const ESPRESSO = toRgb(brand.espresso) ?? [0, 0, 0];
const SURFACE = toRgb(brand.surface) ?? [255, 255, 255];

/// Turns a category's hex accent into the four local vars every accented rule
/// reads: the fill, its tint, ink dark enough to sit on that tint, and the
/// foreground for text laid over the fill. One seed colour drives all four, so
/// a category stays legible whatever the shop picks for it.
export const useAccentVars = (color: string | undefined) =>
  useMemo(() => {
    const seed = toRgb(color);

    if (!seed)
      return assignInlineVars({
        [accent]: "transparent",
        [accentSoft]: "transparent",
        [accentInk]: brand.textHeading,
        [accentOn]: brand.textHeading,
      });

    return assignInlineVars({
      [accent]: toHex(seed),
      [accentSoft]: rgba(seed, 0.14),
      // The tint is thin enough that the surface behind it is a fair stand-in
      // for the background the ink actually lands on.
      [accentInk]: toHex(readableOn(seed, SURFACE, ESPRESSO)),
      [accentOn]:
        contrast(seed, ESPRESSO) >= contrast(seed, SURFACE)
          ? brand.espresso
          : brand.surface,
    });
  }, [color]);
