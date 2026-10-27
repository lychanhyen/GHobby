import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

type PosItem = { productId: string; quantity: number };

function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return `GHB-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getSession();
    if (!sessionData || sessionData.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json();
    const { items, paymentMethod } = body as {
      items?: PosItem[];
      paymentMethod?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Chưa chọn sản phẩm nào" }, { status: 400 });
    }

    if (!paymentMethod || !["CASH", "BANK_TRANSFER"].includes(paymentMethod)) {
      return NextResponse.json({ success: false, message: "Phương thức thanh toán không hợp lệ" }, { status: 400 });
    }

    // Lấy sản phẩm từ DB để đảm bảo giá và tồn kho chính xác
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ success: false, message: "Có sản phẩm không tồn tại" }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalProductAmount = 0;
    const orderItemsData: {
      productId: string;
      productName: string;
      priceAtOrder: number;
      costPriceAtOrder: number;
      quantity: number;
      isDeducted: boolean;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, message: "Có sản phẩm không tồn tại" }, { status: 400 });
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ success: false, message: "Số lượng không hợp lệ" }, { status: 400 });
      }
      if (product.stockQuantity < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} trong kho`,
          },
          { status: 400 }
        );
      }

      totalProductAmount += product.sellingPrice * quantity;
      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        priceAtOrder: product.sellingPrice,
        costPriceAtOrder: product.costPrice,
        quantity,
        isDeducted: true,
      });
    }

    const orderCode = generateOrderCode();
    const viewToken = crypto.randomBytes(16).toString("hex");

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderCode,
          viewToken,
          customerName: "Khách mua tại cửa hàng",
          customerPhone: "",
          customerAddress: "Mua trực tiếp tại cửa hàng",
          provinceCity: "",
          shippingMethod: "STORE_PICKUP",
          shippingArea: "Tại cửa hàng",
          isInnerCity: true,
          shippingFee: 0,
          totalProductAmount,
          depositRequired: 0,
          depositPaid: true,
          status: "COMPLETED",
          channel: "IN_STORE",
          isPreOrderOrder: false,
          note: paymentMethod === "CASH" ? "Thanh toán tiền mặt tại cửa hàng" : "Thanh toán chuyển khoản (QR) tại cửa hàng",
          items: {
            create: orderItemsData,
          },
          statusHistories: {
            create: {
              fromStatus: "COMPLETED",
              toStatus: "COMPLETED",
              actorName: sessionData.user.fullName,
              note: "Đơn bán tại cửa hàng (POS)",
            },
          },
        },
      });

      for (const item of orderItemsData) {
        const product = productMap.get(item.productId)!;
        const balanceAfter = product.stockQuantity - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            orderId: createdOrder.id,
            changeType: "POS_SALE",
            quantityChange: -item.quantity,
            stockBefore: product.stockQuantity,
            stockAfter: balanceAfter,
            costPrice: product.costPrice,
            note: `Bán tại cửa hàng - đơn ${orderCode}`,
            createdById: sessionData.user.id,
            performedBy: sessionData.user.fullName,
          },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Xuất kho thành công",
      data: {
        orderId: order.id,
        orderCode: order.orderCode,
        totalProductAmount: order.totalProductAmount,
      },
    });
  } catch (error) {
    console.error("POS error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra khi xuất kho" }, { status: 500 });
  }
}
