import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for NextAuth / Auth.js session token cookie
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthenticated = !!sessionToken;
  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");

  // Allow Auth.js API routes unconditionally
  if (isAuthApi) {
    return NextResponse.next();
  }

  // Redirect authenticated user away from login page to dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated user to login page
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons/* (PWA icons)
     * - manifest.webmanifest (PWA manifest)
     * - sw.js (Service Worker)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)",
  ],
};
