import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Create a response object
  const response = NextResponse.next();

  // Handle Cloudflare cookie issues in development only
  if (process.env.NODE_ENV === "development") {
    // Remove problematic Cloudflare cookies that might cause domain issues
    const cookies = request.cookies;

    // List of Cloudflare cookies that might cause issues
    const problematicCookies = [
      "__cf_bm",
      "_cf_bm",
      "__cflb",
      "__cfwaitingroom",
    ];

    problematicCookies.forEach((cookieName) => {
      if (cookies.has(cookieName)) {
        response.cookies.delete(cookieName);
      }
    });

    // Set proper CORS headers for development
    response.headers.set(
      "Access-Control-Allow-Origin",
      "http://localhost:3000"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  // In production, just return the response without modifications
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
     * - public files
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
