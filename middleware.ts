import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/login"];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Skip middleware for all API routes - let the API handle auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for REFRESH token instead of access token
  // This allows the client-side interceptor to refresh the access token
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // If the route is NOT public and the user has no refresh token → redirect to /login
  if (!isPublic && !refreshToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged-in user tries to access /login → redirect to /
  if (pathname === "/login" && refreshToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api).*)"],
};