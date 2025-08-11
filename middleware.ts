import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/admin", "/industry", "/collector", "/shop"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Create the base response
  const response = NextResponse.next();

  // Add Content Security Policy headers
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self' https://*.stripe.com https://*.stripe.network https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com",
      "frame-src 'self' https://*.stripe.com https://*.stripe.network https://*.firebaseapp.com",
      "script-src 'self' 'unsafe-inline' https://*.stripe.com https://*.stripe.network https://*.firebaseapp.com https://*.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://*.stripe.com https://*.stripe.network https://fonts.googleapis.com",
      "font-src 'self' data: https://*.stripe.com https://*.stripe.network https://fonts.gstatic.com",
      "img-src 'self' data: https://*.stripe.com https://*.stripe.network https://*.googleapis.com https://www.google.com",
      "connect-src 'self' https://*.stripe.com https://*.stripe.network https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com wss://*.firestore.googleapis.com",
    ].join("; ")
  );

  if (isProtectedRoute) {
    // In a real app, you would check for a valid JWT token
    // For demo purposes, we'll allow access
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
