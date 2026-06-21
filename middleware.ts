import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const supabaseToken = req.cookies.get("sb-access-token")?.value;

  const isLoggedIn = Boolean(supabaseToken);

  const protectedRoutes = [
    "/dashboard",
    "/analytics",
    "/pipelines",
    "/community",
    "/settings",
  ];

  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/pipelines/:path*",
    "/community/:path*",
    "/settings/:path*",
  ],
};
