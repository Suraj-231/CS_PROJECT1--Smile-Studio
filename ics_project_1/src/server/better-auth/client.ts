import { createAuthClient } from "better-auth/react";
import type { Session } from "./config";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import type { auth } from "./config.ts";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});
