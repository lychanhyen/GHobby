import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releaseStock } from "@/lib/inventory";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        statusHistories: {
          include: {
            changedBy: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        confirmedDepositBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

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

    const { id } = await params;
    const body = await req.json();
    const { action, reason, status } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    let newStatus = status || order.status;

    if (action === "confirm_deposit") {
      newStatus = order.isPreOrderOrder ? "PREORDER_DEPOSITED" : "DEPOSITED";
    } else if (action === "cancel") {
      if (!reason) {
        return NextResponse.json({ success: false, message: "Vui lòng nhập lý do hủy đơn" }, { status: 400 });
      }
      newStatus = "CANCELLED";
    } else if (action === "restore") {
      // Try to restore - simple logic
      newStatus = order.isPreOrderOrder ? "PREORDER_PENDING" : "PENDING_DEPOSIT";
    }

    const result = await prisma.$transaction(async (tx) => {
      // If cancelling, release stock
      if (action === "cancel" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          await releaseStock(item.productId, item.quantity, order.id, reason, tx);
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          confirmedDepositById: action === "confirm_deposit" ? sessionData.user.id : order.confirmedDepositById,
          confirmedDepositAt: action === "confirm_deposit" ? new Date() : order.confirmedDepositAt,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: newStatus,
          changedById: sessionData.user.id,
          actorName: sessionData.user.fullName,
          note: reason || action,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({ success: true, message: "Cập nhật đơn hàng thành công", data: result });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json({ success: false, message: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}
