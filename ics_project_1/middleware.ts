import { authClient } from "~/server/better-auth/client";

import { notFound } from "next/navigation";

export async function middleware(request: Request) {
  const { data: session } = await authClient.getSession();

  if (!session?.user.role) {
    return new Response("Unauthorized: You are not logged in", { status: 401 });
  }

  if (session.user.role !== "admin") {
    notFound();
    return;
  }

  return request;
}

export const config = {
  matcher: ["/admin/:path*"],
};
