import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { releaseStock } from "@/lib/inventory";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get timeout from settings or default 24 hours
    const timeoutHours = 24;
    const cutoffTime = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

    // Find orders pending deposit that are expired
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING_DEPOSIT", "PREORDER_PENDING"] },
        createdAt: { lt: cutoffTime },
      },
      include: { items: true },
    });

    let cancelledCount = 0;

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        // Release stock
        for (const item of order.items) {
          await releaseStock(item.productId, item.quantity, order.id, "Tự động hủy do quá hạn cọc", tx);
        }

        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        // Add history
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: "CANCELLED",
            actorName: "SYSTEM_24H_CRON",
            note: "Hệ thống tự động hủy do quá hạn cọc (24h)",
          },
        });
      });

      cancelledCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Đã tự động hủy ${cancelledCount} đơn hàng quá hạn`,
      data: { cancelledCount },
    });
  } catch (error) {
    console.error("Auto cancel error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
