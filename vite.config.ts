import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin({ identifiers: "short" }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Pause Coffee",
        short_name: "Pause",
        description: "Order ahead from Pause Coffee — signature coffee, matcha, and more.",
        theme_color: "#3B2317",
        background_color: "#FBF6EC",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["food", "shopping"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the whole app shell so the menu opens with no network. antd
        // pushes the vendor chunk past the 2 MiB default.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "/index.html",
        // Order data must never come from a stale cache — Supabase calls stay
        // on the network and React Query owns their caching.
        runtimeCaching: [],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/antd/") || id.includes("@ant-design"))
            return "antd";
          if (id.includes("@supabase")) return "supabase";
          return undefined;
        },
      },
    },
  },
});
