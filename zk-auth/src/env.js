import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

const env = createEnv({
  extends: [vercel()],

  /**
   * Specify server-side environment variables schema here.
   */
  server: {
    // twitch
    TWITCH_CLIENT_ID: z.string(),
    TWITCH_CLIENT_SECRET: z.string(),

    // linkedin
    LINKEDIN_CLIENT_ID: z.string(),
    LINKEDIN_CLIENT_SECRET: z.string(),

    // paypal
    PAYPAL_CLIENT_ID: z.string(),
    PAYPAL_CLIENT_SECRET: z.string(),

    // bonsai
    BONSAI_VERSION: z.string(),
    BONSAI_API_KEY: z.string(),
    BONSAI_URL: z.string(),
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
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    BONSAI_VERSION: process.env.BONSAI_VERSION,
    BONSAI_API_KEY: process.env.BONSAI_API_KEY,
    BONSAI_URL: process.env.BONSAI_URL,
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
