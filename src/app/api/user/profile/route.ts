import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, username: true, fullName: true, phone: true, email: true, address: true, city: true, role: true },
    });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Lỗi" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const body = await req.json();
    const { fullName, phone, address } = body || {};

    // Email là thông tin định danh, không cho phép thay đổi qua API này.
    if (body?.email !== undefined) {
      return NextResponse.json(
        { success: false, message: "Email không thể thay đổi" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Lỗi cập nhật" }, { status: 500 });
  }
}
