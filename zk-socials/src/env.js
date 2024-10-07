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
    PASSWORD: z.string(),
  },

  /**
   * Specify client-side environment variables schema here.
   * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
    NEXT_PUBLIC_VERCEL_BRANCH_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes
   * (e.g. middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Client-side environment variables
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,

    // Server-side environment variables
    BONSAI_API_KEY: process.env.BONSAI_API_KEY,
    IMAGE_ID: process.env.IMAGE_ID,
    NODE_ENV: process.env.NODE_ENV,
    PASSWORD: process.env.PASSWORD,
  },
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

export default env;
