import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  build: {
    target: "es2020",
  },
  plugins: [react(), nodePolyfills()],
  server: {
    proxy: {
      "/api/callback": {
        target: "http://0.0.0.0:8080/callback",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/callback/, ""),
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
