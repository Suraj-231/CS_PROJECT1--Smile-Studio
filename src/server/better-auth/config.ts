import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, magicLink } from "better-auth/plugins";

import { resendMagicLink } from "../resend/send-email";

export const auth = betterAuth({
  baseURL: "http://localhost:3000", //process.env.FRONTEND_URL ??
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),

  plugins: [
    admin(),
    magicLink({
      sendMagicLink: async ({ email, token, url, metadata }, ctx) => {
        console.log("[Better-Auth]: DATA", { email, token, url, metadata });
        try {
          const emailResponse = await resendMagicLink(
            email,
            token,
            url,
            metadata,
          );
        } catch (error) {
          console.error(error);
        }
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [env.FRONTEND_URL, "http://localhost:3000"],
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: `http://localhost:3000/api/auth/callback/github`,
    },
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
