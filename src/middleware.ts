import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionUrl = new URL("/api/auth/get-session", request.url);
  const sessionRes = await fetch(sessionUrl, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

  if (!sessionRes.ok) {
    // return new NextResponse("Unauthorized: You are not logged in", {
    //   status: 401,
    // });
    return NextResponse.redirect(new URL("/auth/sign-up", request.url));
   
  }

  const sessionPayload = (await sessionRes.json()) as {
    user?: { role?: string };
    session?: { user?: { role?: string, name: string } };
  };

  if(!sessionPayload) {
    return NextResponse.redirect(new URL("/auth/sign-up", request.url));
  }

  const role =
    sessionPayload.user?.role ?? sessionPayload.session?.user?.role;

  if (!role) {
    return NextResponse.redirect(new URL("/auth", request.url));
    // return new NextResponse("Unauthorized: You are not logged in", {
    //   status: 401,
    // });
    
  }

  if (role !== "admin") {
    console.log(`[MIDDLEWARE]: ${sessionPayload.session?.user?.name}'s role is not admin, redirecting to /profile`);
    return NextResponse.redirect(new URL("/profile", request.url));
    // return new NextResponse("Unauthorized: You do not have admin access", {
    //   status: 403,
    // });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*"
  ],
};
