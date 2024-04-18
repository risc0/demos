await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	reactStrictMode: true,
	transpilePackages: ["@risc0/ui"],
};

export default config;
