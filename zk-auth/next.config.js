import "./src/env.js";

import { nextConfigBase } from "@risc0/ui/config/next.config.base.js";
import deepmerge from "deepmerge";

const config = deepmerge(nextConfigBase, {
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{
						key: "Access-Control-Allow-Origin",
						value: "*", // Set your origin
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET, POST, PUT, DELETE, OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "Content-Type, Authorization",
					},
				],
			},
		];
	},
});

export default config;
