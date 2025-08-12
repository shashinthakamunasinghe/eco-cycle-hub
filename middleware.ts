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
      "frame-src 'self' https://*.stripe.com https://*.stripe.network https://*.firebaseapp.com https://js.stripe.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://*.stripe.network https://*.firebaseapp.com https://*.googleapis.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://*.stripe.com https://*.stripe.network https://fonts.googleapis.com https://m.stripe.network https://js.stripe.com",
      "font-src 'self' data: https://*.stripe.com https://*.stripe.network https://fonts.gstatic.com https://m.stripe.network https://js.stripe.com",
      "img-src 'self' data: blob: https://*.stripe.com https://*.stripe.network https://*.googleapis.com https://www.google.com https://m.stripe.network",
      "connect-src 'self' https://*.stripe.com https://*.stripe.network https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com wss://*.firestore.googleapis.com https://m.stripe.network https://m.stripe.com",
      "media-src 'self' https://*.stripe.com",
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
};
