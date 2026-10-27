import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Tên cookie PHẢI khớp 100% với src/lib/auth.ts
const SESSION_COOKIE_NAME = "ghobby_admin_session";
const ROLE_COOKIE_NAME = "ghobby_role";

// Middleware chạy trên Edge Runtime => KHÔNG dùng Prisma / node:crypto ở đây.
// Việc xác thực session + role đầy đủ được làm trong server layout (Node runtime).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) API auth luôn được bỏ qua
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const isLoggedIn = Boolean(token);
  const isAdmin = isLoggedIn && role === "ADMIN";

  // 2) PUBLIC ROUTES: KHÔNG BAO GIỜ redirect tại đây (tránh vòng lặp 307)
  if (pathname === "/login" || pathname === "/admin/login" || pathname === "/register") {
    return NextResponse.next();
  }

  // 3) Khu vực quản trị
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // 4) Khu vực yêu cầu đăng nhập của khách hàng
  const isCustomerOnlyPath =
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/thanh-toan" ||
    pathname.startsWith("/thanh-toan/") ||
    pathname === "/user" ||
    pathname.startsWith("/user/");

  if (isCustomerOnlyPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 5) ADMIN không tham gia luồng mua hàng công cộng
  if (isAdmin) {
    const isShopPath =
      pathname === "/" ||
      pathname === "/gio-hang" ||
      pathname.startsWith("/gio-hang/") ||
      pathname === "/danh-muc" ||
      pathname.startsWith("/danh-muc/") ||
      pathname === "/san-pham" ||
      pathname.startsWith("/san-pham/") ||
      pathname === "/tra-cuu-don-hang" ||
      pathname.startsWith("/tra-cuu-don-hang/");

    if (isShopPath) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
