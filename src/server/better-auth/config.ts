import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { admin, magicLink } from "better-auth/plugins";

import { Resend } from "resend";

const resend = new Resend("re_8idkagFB_KAngjFMofa6JARektyzTzxos");

export const auth = betterAuth({
  baseURL: "http://localhost:3000", //env.FRONTEND_URL ??
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),

  plugins: [
    admin(),
    magicLink({
      sendMagicLink: async ({ email, token, url, metadata }, ctx) => {
        console.log("[Better-Auth]: DATA", { email, token, url, metadata });
        try {
          const { data, error } = await resend.emails.send({
            from: "Dental Clinic <noreply@singularity.co.ke>",
            to: [email],
            subject: "Magic Link",
            html: `
              <p>Your magic link is ready to use!</p>
              <p><a href="${url}">Click here to log in</a></p>
            `,
          });
          if (error) {
            console.log("RESEND ERROR", error);
          }
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
