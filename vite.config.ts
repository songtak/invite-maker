import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { ViteFaviconsPlugin } from "vite-plugin-favicon";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // base: "www.emoji2025.site",
  // base: "https://songtak.github.io/invite-maker",
  plugins: [
    react(),
    // ViteFaviconsPlugin({
    //   logo: "public/logo.png",
    // }),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "/src") },
      { find: "@assets", replacement: path.resolve(__dirname, "src/assets") },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
      {
        find: "@interfaces",
        replacement: path.resolve(__dirname, "src/interfaces"),
      },
      { find: "@libs", replacement: path.resolve(__dirname, "src/libs") },
      // { find: "@pages", replacement: "/src/pages" },
      { find: "@pages", replacement: path.resolve(__dirname, "src/pages") },
      { find: "@routes", replacement: path.resolve(__dirname, "src/routes") },
      {
        find: "@services",
        replacement: path.resolve(__dirname, "src/services"),
      },
      { find: "@stores", replacement: path.resolve(__dirname, "src/stores") },
    ],
  },
});
