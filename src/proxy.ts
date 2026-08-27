import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly middleware) — Next.js 16 renamed middleware to proxy.
 * Handles auth route protection.
 *
 * Auth.js v5's `auth()` wrapper is not proxy-aware yet, so we check
 * for the session cookie directly. The session JWT cookie name used by
 * Auth.js is `authjs.session-token` (or `__Secure-authjs.session-token`
 * in production/HTTPS).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");

  // Allow auth API routes and static assets
  if (isAuthApi) return NextResponse.next();

  // Check for Auth.js session cookie
  const sessionCookie =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  // Redirect logged-in users away from login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw.js).*)",
  ],
};
