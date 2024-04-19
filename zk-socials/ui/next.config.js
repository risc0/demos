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

  async redirects() {
    return [
      {
        source: "/web3-wallet",
        destination: "/#/web3-wallet",
        permanent: true,
      },
    ];
  },
};

export default config;
