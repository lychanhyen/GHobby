import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "ghobby_admin_session";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // For basic protection, redirect to login if no token
    // Full session validation will be done in server components/pages
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
