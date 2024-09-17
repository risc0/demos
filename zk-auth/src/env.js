import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

const env = createEnv({
  extends: [vercel()],

  /**
   * Specify server-side environment variables schema here.
   */
  server: {
    BONSAI_API_KEY: z.string(),
    IMAGE_ID: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify client-side environment variables schema here.
   * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {},

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes
   * (e.g. middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server-side environment variables
    BONSAI_API_KEY: process.env.BONSAI_API_KEY,
    IMAGE_ID: process.env.IMAGE_ID,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

export default env;
