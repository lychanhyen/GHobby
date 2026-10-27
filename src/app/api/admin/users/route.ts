import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionData = await getSession();
    if (!sessionData || sessionData.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        city: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
