import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  REVIEW_MAX_COMMENT,
  REVIEW_MAX_IMAGES,
  REVIEW_MIN_COMMENT,
  REVIEW_PURCHASE_STATUSES,
} from "@/lib/reviews";

function isValidImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const url = value.trim();
  if (!url || url.length > 600) return false;
  return url.startsWith("/uploads/") || url.startsWith("https://");
}

export async function POST(req: NextRequest) {
  try {
    // CSRF check
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập để đánh giá" }, { status: 401 });
    }
    if (session.user.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Chỉ khách hàng mới có thể đánh giá sản phẩm" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const productId = typeof body.productId === "string" ? body.productId : "";
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const rawImages = Array.isArray(body.images) ? body.images : [];

    if (!productId) {
      return NextResponse.json({ success: false, message: "Thiếu sản phẩm cần đánh giá" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Vui lòng chọn số sao từ 1 đến 5" }, { status: 400 });
    }
    if (comment.length < REVIEW_MIN_COMMENT) {
      return NextResponse.json(
        { success: false, message: `Bình luận cần ít nhất ${REVIEW_MIN_COMMENT} ký tự` },
        { status: 400 }
      );
    }
    if (comment.length > REVIEW_MAX_COMMENT) {
      return NextResponse.json(
        { success: false, message: `Bình luận tối đa ${REVIEW_MAX_COMMENT} ký tự` },
        { status: 400 }
      );
    }

    const images: string[] = Array.from(
      new Set<string>(rawImages.filter(isValidImageUrl))
    ).slice(0, REVIEW_MAX_IMAGES);
    if (rawImages.length > REVIEW_MAX_IMAGES) {
      return NextResponse.json(
        { success: false, message: `Chỉ được gửi tối đa ${REVIEW_MAX_IMAGES} ảnh` },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, message: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Chỉ khách đã mua sản phẩm (đơn hoàn tất / pre-order đã về) mới được đánh giá
    const purchasedItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: [...REVIEW_PURCHASE_STATUSES] },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
      select: { orderId: true },
    });

    if (!purchasedItem) {
      return NextResponse.json(
        { success: false, message: "Bạn cần mua sản phẩm này để có thể đánh giá" },
        { status: 403 }
      );
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: {
        rating,
        comment,
        images,
        orderId: purchasedItem.orderId,
        isVisible: true,
      },
      create: {
        userId: session.user.id,
        productId,
        rating,
        comment,
        images,
        orderId: purchasedItem.orderId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn đã đánh giá sản phẩm",
      data: { id: review.id, rating: review.rating },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra, vui lòng thử lại" }, { status: 500 });
  }
}
