import { createAuthClient } from "better-auth/react";
import type { Session } from "./config";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import type { auth } from "./config.ts";

export const authClient = createAuthClient({
  plugins: [adminClient(), magicLinkClient()],
});
