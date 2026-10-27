import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await getSession();
    if (!sessionData || sessionData.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role, isActive } = body as { role?: string; isActive?: boolean };

    if (id === sessionData.user.id) {
      return NextResponse.json(
        { success: false, message: "Không thể thay đổi vai trò hoặc khoá chính tài khoản đang đăng nhập" },
        { status: 400 }
      );
    }

    const data: { role?: "ADMIN" | "STAFF" | "USER"; isActive?: boolean } = {};

    if (role !== undefined) {
      if (!["ADMIN", "STAFF", "USER"].includes(role)) {
        return NextResponse.json({ success: false, message: "Vai trò không hợp lệ" }, { status: 400 });
      }
      data.role = role as "ADMIN" | "STAFF" | "USER";
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, message: "Không có dữ liệu cập nhật" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        city: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, message: "Cập nhật người dùng thành công", data: user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
