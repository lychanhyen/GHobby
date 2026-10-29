import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, getClientIp } from "@/lib/auth";

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
    const { fullName, username, email, password, phone, city } = body as {
      fullName?: string;
      username?: string;
      email?: string;
      password?: string;
      phone?: string;
      city?: string;
    };

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedCity = typeof city === "string" ? city.trim() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, message: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Tên đăng nhập đã tồn tại" },
        { status: 409 }
      );
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email đã được sử dụng" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        passwordHash,
        fullName: trimmedFullName,
        phone: trimmedPhone || null,
        city: trimmedCity || null,
        role: "USER",
        mustChangePassword: false,
      },
    });

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    await createSession(user.id, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          city: user.city,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
