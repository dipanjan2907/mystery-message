import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const isPublicRoute =
    url.pathname === "/" ||
    url.pathname.startsWith("/auth/sign-in") ||
    url.pathname.startsWith("/auth/signup") ||
    url.pathname.startsWith("/auth/verify");

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/sign-in",
    "/auth/signup",
    "/",
    "/dashboard/:path*",
    "/auth/verify/:path*",
  ],
};
