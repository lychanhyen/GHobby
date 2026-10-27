import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkLoginAttempts, recordLoginAttempt, createSession, verifyPassword, getClientIp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // CSRF check
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");
    
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
    }
    if (!origin && referer && host && !referer.includes(host)) {
      return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    // Check login attempts
    const canAttempt = await checkLoginAttempts(ipAddress, username);
    if (!canAttempt) {
      await recordLoginAttempt(ipAddress, username, false);
      return NextResponse.json(
        { success: false, message: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút." },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      await recordLoginAttempt(ipAddress, username, false);
      return NextResponse.json({ success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 });
    }

    if (!user.isActive) {
      await recordLoginAttempt(ipAddress, username, false);
      return NextResponse.json(
        { success: false, message: "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await recordLoginAttempt(ipAddress, username, false);
      return NextResponse.json({ success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 });
    }

    // Success
    await recordLoginAttempt(ipAddress, username, true);
    await createSession(user.id, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        mustChangePassword: user.mustChangePassword,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
