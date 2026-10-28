import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { reserveStock } from "@/lib/inventory";
import { getClientIp, getSession } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { getShippingQuote } from "@/lib/shipping";
import crypto from "crypto";

const ORDER_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_QUANTITY_PER_PRODUCT = 3;
const MAX_PENDING_ORDERS_PER_PHONE = 2;

class CheckoutValidationError extends Error {}

function generateOrderCode(): string {
  const bytes = crypto.randomBytes(6);
  let result = "GH-";
  for (let i = 0; i < bytes.length; i++) {
    result += ORDER_CODE_CHARS.charAt(bytes[i] % ORDER_CODE_CHARS.length);
  }
  return result;
}

function generateViewToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Dữ liệu gửi lên không hợp lệ" },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      customerAddress,
      provinceCity,
      items,
      note,
      shippingMethod: rawShippingMethod,
    } = body;

    const shippingMethod: "DELIVERY" | "STORE_PICKUP" =
      rawShippingMethod === "STORE_PICKUP" ? "STORE_PICKUP" : "DELIVERY";

    if (rawShippingMethod && !["DELIVERY", "STORE_PICKUP"].includes(rawShippingMethod)) {
      return NextResponse.json({ success: false, message: "Phương thức giao hàng không hợp lệ" }, { status: 400 });
    }

    const name = typeof customerName === "string" ? customerName.trim() : "";
    const phone = typeof customerPhone === "string" ? customerPhone.trim() : "";

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập họ tên hợp lệ" }, { status: 400 });
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      return NextResponse.json({ success: false, message: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    if (!phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
    }

    if (shippingMethod === "DELIVERY") {
      if (
        typeof customerAddress !== "string" ||
        customerAddress.trim().length === 0 ||
        typeof provinceCity !== "string" ||
        provinceCity.trim().length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập địa chỉ và tỉnh/thành phố nhận hàng" },
          { status: 400 }
        );
      }
    }

    if (typeof note === "string" && note.length > 500) {
      return NextResponse.json({ success: false, message: "Ghi chú không được vượt quá 500 ký tự" }, { status: 400 });
    }

    // Chỉ nhận productId + quantity từ client (hỗ trợ tạm dạng cũ item.product.id).
    // Gộp các dòng trùng sản phẩm để không thể lách giới hạn bằng cách gửi nhiều dòng.
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const productId =
        typeof item?.productId === "string" ? item.productId : item?.product?.id;
      const quantity = Number(item?.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          { success: false, message: "Số lượng sản phẩm không hợp lệ" },
          { status: 400 }
        );
      }

      quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity);
    }

    const normalizedItems = Array.from(quantityByProduct, ([productId, quantity]) => ({
      productId,
      quantity,
    }));

    for (const item of normalizedItems) {
      if (item.quantity > MAX_QUANTITY_PER_PRODUCT) {
        return NextResponse.json(
          { success: false, message: "Mỗi sản phẩm chỉ được đặt tối đa 3 hộp" },
          { status: 400 }
        );
      }
    }

    const ipAddress = getClientIp(req);
    const settings = await getStoreSettings();
    const sessionData = await getSession();
    const customerUserId =
      sessionData && sessionData.user.role !== "ADMIN" ? sessionData.user.id : null;
    // For express shipping with over 3km requiring quote - check from body
    const expressType =
      body?.expressType === "under3km" || body?.expressType === "over3km"
        ? body.expressType
        : "standard";
    if (expressType === "over3km") {
      throw new CheckoutValidationError("Khoảng cách giao hàng trên 3km, vui lòng nhắn Zalo để shop báo phí hỏa tốc cụ thể.");
    }

    const quote = getShippingQuote({
      shippingMethod,
      expressType,
      provinceCity,
      customerAddress,
      settings,
    });
    const shippingFee = quote.shippingFee;
    const isInnerCity = quote.isInnerCity;
    const shippingArea = quote.shippingArea;

    let order: {
      id: string;
      orderCode: string;
      viewToken: string;
      shippingMethod: string;
    } | null = null;

    // Mã đơn có thể trùng unique (P2002) => thử tạo lại tối đa 5 lần.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await prisma.$transaction(async (tx) => {
          const productIds = normalizedItems.map((item) => item.productId);
          const products = await tx.product.findMany({
            where: { id: { in: productIds } },
          });

          if (products.length !== productIds.length) {
            throw new CheckoutValidationError("Một số sản phẩm không tồn tại hoặc đã bị xóa");
          }

          if (products.some((product) => !product.isActive)) {
            throw new CheckoutValidationError("Một số sản phẩm đã ngừng bán");
          }

          const productTypes = new Set(products.map((product) => product.productType));
          if (productTypes.size > 1) {
            throw new CheckoutValidationError(
              "Không thể đặt đơn hỗn hợp hàng có sẵn và pre-order. Vui lòng tách thành 2 đơn riêng biệt."
            );
          }

          const productMap = new Map(products.map((product) => [product.id, product]));
          const isPreOrderOrder = products[0].productType === "PRE_ORDER";

          for (const item of normalizedItems) {
            const product = productMap.get(item.productId)!;

            if (product.productType === "IN_STOCK" && product.stockQuantity < item.quantity) {
              throw new CheckoutValidationError(
                `Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} hộp trong kho`
              );
            }

            if (product.productType === "PRE_ORDER") {
              const availableSlots =
                product.preOrderLimit > 0
                  ? product.preOrderLimit - product.preOrderCount
                  : MAX_QUANTITY_PER_PRODUCT;

              if (item.quantity > availableSlots) {
                throw new CheckoutValidationError(
                  `Sản phẩm "${product.name}" chỉ còn ${Math.max(0, availableSlots)} suất pre-order`
                );
              }
            }
          }

          const pendingOrderCount = await tx.order.count({
            where: {
              customerPhone: phone,
              status: { in: ["PENDING_DEPOSIT", "PREORDER_PENDING"] },
            },
          });

          if (pendingOrderCount >= MAX_PENDING_ORDERS_PER_PHONE) {
            throw new CheckoutValidationError(
              "Số điện thoại này đang có 2 đơn chờ cọc. Vui lòng hoàn tất hoặc hủy bớt đơn cũ trước khi đặt đơn mới."
            );
          }

          let totalProductAmount = 0;
          for (const item of normalizedItems) {
            const product = productMap.get(item.productId)!;
            totalProductAmount += product.sellingPrice * item.quantity;
          }
          const depositRequired = Math.round(totalProductAmount * 0.1);

          const orderCode = generateOrderCode();
          const viewToken = generateViewToken();
          const isStorePickupOrder = shippingMethod === "STORE_PICKUP";

          const newOrder = await tx.order.create({
            data: {
              orderCode,
              viewToken,
              userId: customerUserId,
              customerName: name,
              customerPhone: phone,
              customerAddress: isStorePickupOrder ? "Nhận tại cửa hàng" : customerAddress,
              provinceCity: isStorePickupOrder ? "" : provinceCity,
              shippingMethod,
              shippingArea: isStorePickupOrder ? "Tại cửa hàng" : shippingArea,
              isInnerCity: isStorePickupOrder ? true : isInnerCity,
              shippingFee,
              totalProductAmount,
              depositRequired,
              depositPaid: false,
              status: isPreOrderOrder ? "PREORDER_PENDING" : "PENDING_DEPOSIT",
              isPreOrderOrder,
              customerIp: ipAddress,
              note: note || null,
            },
          });

          // Tạo order items + giữ kho; giá và tên lấy từ DB, không tin client.
          for (const item of normalizedItems) {
            const product = productMap.get(item.productId)!;

            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: product.id,
                productName: product.name,
                priceAtOrder: product.sellingPrice,
                costPriceAtOrder: product.costPrice,
                quantity: item.quantity,
                isDeducted: false,
                isPreOrderItem: isPreOrderOrder,
              },
            });

            await reserveStock(product.id, item.quantity, newOrder.id, tx);
          }

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

        break;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          continue;
        }
        throw error;
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không thể tạo đơn hàng, vui lòng thử lại" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      data: {
        orderId: order.id,
        orderCode: order.orderCode,
        viewToken: order.viewToken,
        shippingMethod: order.shippingMethod,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
