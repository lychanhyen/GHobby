import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reserveStock } from "@/lib/inventory";
import { getClientIp } from "@/lib/auth";
import crypto from "crypto";

function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "GH-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateViewToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, provinceCity, items, note } = body;

    if (!customerName || !customerPhone || !customerAddress || !provinceCity || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
    }

    // Check if cart has mixed items
    const hasInStock = items.some((item: any) => item.product.productType === "IN_STOCK");
    const hasPreOrder = items.some((item: any) => item.product.productType === "PRE_ORDER");
    if (hasInStock && hasPreOrder) {
      return NextResponse.json(
        { success: false, message: "Không thể đặt đơn hỗn hợp hàng có sẵn và pre-order" },
        { status: 400 }
      );
    }

    const isPreOrderOrder = hasPreOrder;
    const ipAddress = getClientIp(req);

    // Calculate totals
    let totalProductAmount = 0;
    for (const item of items) {
      totalProductAmount += item.product.sellingPrice * item.quantity;
    }
    const depositRequired = Math.round(totalProductAmount * 0.1);

    const order = await prisma.$transaction(async (tx) => {
      const orderCode = generateOrderCode();
      const viewToken = generateViewToken();

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          viewToken,
          customerName,
          customerPhone,
          customerAddress,
          provinceCity,
          shippingArea: provinceCity,
          isInnerCity: false,
          shippingFee: 20000,
          totalProductAmount,
          depositRequired,
          depositPaid: false,
          status: isPreOrderOrder ? "PREORDER_PENDING" : "PENDING_DEPOSIT",
          isPreOrderOrder,
          customerIp: ipAddress,
          note: note || null,
        },
      });

      // Create order items and reserve stock
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.product.id,
            productName: item.product.name,
            priceAtOrder: item.product.sellingPrice,
            costPriceAtOrder: item.product.costPrice,
            quantity: item.quantity,
            isDeducted: false,
            isPreOrderItem: isPreOrderOrder,
          },
        });

        // Reserve stock
        await reserveStock(item.product.id, item.quantity, newOrder.id, tx);
      }

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: isPreOrderOrder ? "PREORDER_PENDING" : "PENDING_DEPOSIT",
          toStatus: isPreOrderOrder ? "PREORDER_PENDING" : "PENDING_DEPOSIT",
          actorName: "SYSTEM",
          note: "Tạo đơn hàng",
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      data: {
        orderCode: order.orderCode,
        viewToken: order.viewToken,
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, message: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}
