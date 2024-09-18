import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/zk-auth.tsx"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/zk-auth.tsx"),
      name: "ZkAuth",
      fileName: "zk-auth",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
