import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const order = await prisma.order.findUnique({
      where: { orderCode: code },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    if (order.status === "PAYMENT_SUBMITTED") {
      return NextResponse.json({ success: false, message: "Đã ghi nhận chuyển khoản trước đó" }, { status: 400 });
    }

    if (order.status !== "PENDING_DEPOSIT" && order.status !== "PREORDER_PENDING") {
      return NextResponse.json({ success: false, message: "Không thể xác nhận thanh toán cho đơn hàng này" }, { status: 400 });
    }

    const newStatus = order.isPreOrderOrder ? "PREORDER_PENDING" : "PAYMENT_SUBMITTED";

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: newStatus,
          actorName: "CUSTOMER",
          note: "Khách hàng xác nhận đã chuyển khoản cọc",
        },
      });
    });

    return NextResponse.json({ success: true, message: "Đã ghi nhận thông tin chuyển khoản" });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
