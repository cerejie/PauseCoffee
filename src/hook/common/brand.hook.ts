import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useMemo } from "react";
import { brand, brandFonts } from "../../constants/brand.constants";
import {
  colorBorder,
  colorBorderSoft,
  colorCanvas,
  colorCanvasDeep,
  colorCanvasVeil,
  colorDanger,
  colorEspresso,
  colorEspressoSoft,
  colorEspressoWash,
  colorInfo,
  colorMatcha,
  colorOnEspresso,
  colorOnEspressoFaint,
  colorOnEspressoLine,
  colorOnEspressoMuted,
  colorOnEspressoWash,
  colorPrimary,
  colorPrimaryDeep,
  colorPrimarySoft,
  colorSuccess,
  colorSurface,
  colorSurfaceAlt,
  colorSurfaceVeil,
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
        [colorOnEspresso]: brand.onEspresso,
        [colorOnEspressoMuted]: brand.onEspressoMuted,
        [colorOnEspressoFaint]: brand.onEspressoFaint,
        [colorOnEspressoWash]: brand.onEspressoWash,
        [colorOnEspressoLine]: brand.onEspressoLine,
        [colorEspressoWash]: brand.espressoWash,
        [colorCanvas]: brand.canvas,
        [colorCanvasDeep]: brand.canvasDeep,
        [colorCanvasVeil]: brand.canvasVeil,
        [colorSurface]: brand.surface,
        [colorSurfaceAlt]: brand.surfaceAlt,
        [colorSurfaceVeil]: brand.surfaceVeil,
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
