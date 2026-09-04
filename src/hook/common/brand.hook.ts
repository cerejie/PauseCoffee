import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useMemo } from "react";
import { brand, brandFonts } from "../../constants/brand.constants";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvas,
  colorCanvasDeep,
  colorDanger,
  colorEspresso,
  colorEspressoSoft,
  colorInfo,
  colorMatcha,
  colorPrimary,
  colorPrimaryDeep,
  colorPrimarySoft,
  colorSuccess,
  colorSurface,
  colorSurfaceAlt,
  colorTextBody,
  colorTextHeading,
  colorTextMuted,
  colorWarning,
  fontBody,
  fontDisplay,
} from "../../styles/common/vars.css";

/// Assigns the whole style contract once, on the app root element. Every
/// vanilla-extract rule below it resolves; a component that renders outside
/// this root (a portalled antd Drawer, say) has to be given the vars again —
/// see useAccentVars for the local case.
export const useBrandVars = () =>
  useMemo(
    () =>
      assignInlineVars({
        [colorPrimary]: brand.primary,
        [colorPrimaryDeep]: brand.primaryDeep,
        [colorPrimarySoft]: brand.primarySoft,
        [colorEspresso]: brand.espresso,
        [colorEspressoSoft]: brand.espressoSoft,
        [colorCanvas]: brand.canvas,
        [colorCanvasDeep]: brand.canvasDeep,
        [colorSurface]: brand.surface,
        [colorSurfaceAlt]: brand.surfaceAlt,
        [colorBorder]: brand.border,
        [colorBorderSoft]: brand.borderSoft,
        [colorTextHeading]: brand.textHeading,
        [colorTextBody]: brand.textBody,
        [colorTextMuted]: brand.textMuted,
        [colorMatcha]: brand.matcha,
        [colorSuccess]: brand.success,
        [colorWarning]: brand.warning,
        [colorDanger]: brand.danger,
        [colorInfo]: brand.info,
        [fontDisplay]: brandFonts.display,
        [fontBody]: brandFonts.body,
      }),
    [],
  );
