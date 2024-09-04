await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@risc0/ui"],
  experimental: {
    caseSensitiveRoutes: true,
  },
};

export default config;
