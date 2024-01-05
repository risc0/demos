import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2020",
  },
  plugins: [react(), nodePolyfills()],
  // server: {
  //       https: {
  //     key: fs.readFileSync('key.pem'),
  //     cert: fs.readFileSync('cert.pem'),
  //   }
  // }
});
