import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!review) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đánh giá" }, { status: 404 });
    }
    if (review.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Không có quyền xoá đánh giá này" }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xoá đánh giá" });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
