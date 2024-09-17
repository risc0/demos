import "./src/env.js";

import { nextConfigBase } from "@risc0/ui/config/next.config.base.js";
import deepmerge from "deepmerge";

const config = deepmerge(nextConfigBase, {
	typescript: {
		ignoreBuildErrors: true,
	},
});

export default config;
