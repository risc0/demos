await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  transpilePackages: ["@risc0/ui"],

  // biome-ignore lint/suspicious/useAwait: need async
  async redirects() {
    return [
      {
        source: "/web3-wallet",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default config;
