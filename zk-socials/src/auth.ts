import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import env from "./env";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "password",
      credentials: {
        password: {
          label: "Password",
          type: "password",
        },
      },

      // biome-ignore lint/suspicious/useAwait: keep async
      async authorize(credentials, _request) {
        if (credentials?.password === env.NEXTAUTH_PASSWORD) {
          return { id: "0" };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
};
