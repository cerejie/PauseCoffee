import { QueryClient } from "@tanstack/react-query";
import type { ThemeConfig } from "antd";
import { useMemo } from "react";
import { createBrowserRouter } from "react-router-dom";
import { brand, brandFonts } from "../../constants/brand.constants";
import { appRoutes } from "../../routes/app.routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The menu barely changes during a shift; the queue is pushed by realtime
      // rather than polled, so a minute of staleness costs nothing either way.
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter(appRoutes);

const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: brand.primary,
    colorInfo: brand.info,
    colorSuccess: brand.success,
    colorWarning: brand.warning,
    colorError: brand.danger,
    colorTextBase: brand.textBody,
    // Spelled out rather than left to antd's alpha ladder off colorTextBase.
    // Placeholders and field hints landed near 25% of the body colour there,
    // which on cream is barely a colour at all — "Any menu" and "Search an
    // item…" read as empty controls.
    colorText: brand.textBody,
    colorTextHeading: brand.textHeading,
    colorTextDescription: brand.textMuted,
    colorTextPlaceholder: brand.textMuted,
    colorBgBase: brand.canvas,
    colorBgContainer: brand.surface,
    // The panel a Select opens into is portalled, so it takes its ground from
    // the theme rather than from the style contract.
    colorBgElevated: brand.surface,
    colorBorder: brand.border,
    colorBorderSecondary: brand.borderSoft,
    fontFamily: brandFonts.body,
    borderRadius: 12,
    controlHeight: 40,
    fontSize: 14,
  },
  components: {
    Button: { borderRadius: 999, fontWeight: 600, primaryShadow: "none" },
    Input: { borderRadius: 12, paddingBlock: 9 },
    Select: {
      borderRadius: 12,
      optionSelectedBg: brand.primarySoft,
      optionSelectedColor: brand.textHeading,
      optionActiveBg: brand.surfaceAlt,
    },
    Modal: { borderRadiusLG: 20 },
    Drawer: { paddingLG: 0 },
    Segmented: { borderRadius: 12 },
    Table: { headerBg: brand.primarySoft, borderColor: brand.borderSoft },
  },
};

export const useAppHook = () => {
  const config = useMemo(() => themeConfig, []);
  return { config, queryClient, router };
};
