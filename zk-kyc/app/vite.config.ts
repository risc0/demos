import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs";

export default defineConfig({
  build: {
    target: "es2020",
  },
  plugins: [react(), nodePolyfills()],
  server: {
    proxy: {
      "/api/auth": {
        target: "http://0.0.0.0:8181",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ""),
      },
      "/api/attributes": {
        target: "https://api.id.me/api/public/v3/userinfo.json",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/attributes/, ""),
        secure: true,
      },
    },
  },
});
