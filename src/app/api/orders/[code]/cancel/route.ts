import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const session = await getSession();
    const order = await prisma.order.findUnique({ where: { orderCode: code } });
    if (!order) return NextResponse.json({ success: false, message: "Không tìm thấy đơn" }, { status: 404 });

    const isOwner = session?.user?.id === order.userId;
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const hasToken = token && order.viewToken === token;
    if (!isOwner && !hasToken) {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
    }

    if (order.status === "CANCELLED" || order.status === "RETURNED") {
      return NextResponse.json({ success: false, message: "Đơn đã bị huỷ" }, { status: 400 });
    }

    // Cancel but keep deposit (do not refund)
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    // Restock if deducted
    for (const item of await prisma.orderItem.findMany({ where: { orderId: order.id } })) {
      if (item.isDeducted) {
        const productBefore = await prisma.product.findUnique({ where: { id: item.productId }, select: { stockQuantity: true } });
        const stockBefore = productBefore?.stockQuantity ?? 0;
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            orderId: order.id,
            changeType: "ORDER_CANCEL_RESTOCK",
            quantityChange: item.quantity,
            stockBefore,
            stockAfter: stockBefore + item.quantity,
            performedBy: "SYSTEM",
            createdById: null,
            note: `Huỷ đơn ${order.orderCode} - không hoàn cọc`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Đã huỷ đơn (không hoàn cọc)" });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Lỗi" }, { status: 500 });
  }
}
