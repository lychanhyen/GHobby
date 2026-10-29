import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    if (!["ADMIN", "STAFF"].includes(sessionData.user.role)) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    if (!["ADMIN", "STAFF"].includes(sessionData.user.role)) {
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
    const {
      sku,
      name,
      categoryId,
      brand,
      scale,
      series,
      costPrice,
      sellingPrice,
      stockQuantity,
      minStockAlert,
      productType,
      expectedReleaseDate,
      preOrderLimit,
      imageUrl,
      description,
      isActive,
    } = body;

    if (!sku || !name || !categoryId || !sellingPrice || !imageUrl || !description) {
      return NextResponse.json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc" }, { status: 400 });
    }

    const slug = slugify(name);

    // Check if SKU or slug exists for other products
    const existingSku = await prisma.product.findFirst({
      where: { sku, NOT: { id } },
    });
    if (existingSku) {
      return NextResponse.json({ success: false, message: "SKU đã tồn tại" }, { status: 400 });
    }

    const existingSlug = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: "Sản phẩm đã tồn tại" }, { status: 400 });
    }

    // Lấy tồn kho hiện tại để so sánh và ghi nhật ký kho
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { stockQuantity: true },
    });
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const newStockQuantity =
      stockQuantity !== undefined ? Number(stockQuantity) : existingProduct.stockQuantity;

    if (!Number.isInteger(newStockQuantity) || newStockQuantity < 0) {
      return NextResponse.json(
        { success: false, message: "Tồn kho phải là số nguyên không âm" },
        { status: 400 }
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          sku,
          name,
          slug,
          categoryId,
          brand: brand || "",
          scale: scale || "",
          series: series || "",
          costPrice: parseInt(costPrice) || 0,
          sellingPrice: parseInt(sellingPrice),
          stockQuantity: newStockQuantity,
          minStockAlert: parseInt(minStockAlert) || 2,
          productType: productType || "IN_STOCK",
          expectedReleaseDate: expectedReleaseDate ? new Date(expectedReleaseDate) : null,
          preOrderLimit: parseInt(preOrderLimit) || 0,
          imageUrl,
          description,
          isActive: isActive !== undefined ? isActive : true,
        },
        include: { category: true },
      });

      // Chỉ ghi log khi tồn kho thực sự thay đổi
      if (newStockQuantity !== existingProduct.stockQuantity) {
        await tx.inventoryLog.create({
          data: {
            productId: id,
            changeType: "MANUAL_ADJUST",
            quantityChange: newStockQuantity - existingProduct.stockQuantity,
            stockBefore: existingProduct.stockQuantity,
            stockAfter: newStockQuantity,
            performedBy: sessionData.user.fullName,
            createdById: sessionData.user.id,
            note: `Chỉnh sửa tồn kho thủ công: ${existingProduct.stockQuantity} → ${newStockQuantity}`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    if (!["ADMIN", "STAFF"].includes(sessionData.user.role)) {
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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true, inventoryLogs: true, wishlists: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const hasHistory =
      product._count.orderItems > 0 ||
      product._count.inventoryLogs > 0 ||
      product._count.wishlists > 0;

    if (hasHistory) {
      // Sản phẩm đã phát sinh đơn hàng/lịch sử kho: chỉ ẩn để giữ dữ liệu đối soát
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Sản phẩm đã phát sinh đơn hàng hoặc lịch sử kho nên chỉ được ẩn khỏi cửa hàng",
      });
    }

    // Chưa phát sinh dữ liệu liên quan: xóa vĩnh viễn để có thể xóa danh mục
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
