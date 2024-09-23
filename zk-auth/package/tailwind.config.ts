import tailwindConfig from "@risc0/ui/config/tailwind.config.base";
import deepmerge from "deepmerge";
import type { Config } from "tailwindcss";

const config = deepmerge(tailwindConfig, {
  theme: {
    fontFamily: {
      sans: ["var(--font-europa-sans)", "system-ui"],
      mono: ["var(--font-mono)", "monospace"],
    },
    extend: {
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
      },
    },
  },
}) satisfies Config;

config.content = ["./node_modules/@risc0/ui/**/*.{ts,tsx}", "./src/**/*.{js,jsx,ts,tsx,mdx}"];

export default config;
