import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useMemo } from "react";
import { accent, accentSoft } from "../../styles/common/vars.css";

/// Turns a category's hex accent into the two local vars every accented rule
/// reads. The soft variant is the same hue at ~14% alpha, so one seed colour
/// drives both the pill fill and its tint without a second column in the DB.
export const useAccentVars = (color: string | undefined) =>
  useMemo(() => {
    const base = color ?? "";
    return assignInlineVars({
      [accent]: base,
      [accentSoft]: base ? `${base}24` : "transparent",
    });
  }, [color]);
