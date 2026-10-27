import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: "Mật khẩu mới phải có ít nhất 8 ký tự" }, { status: 400 });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, sessionData.user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, { status: 401 });
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: sessionData.user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
