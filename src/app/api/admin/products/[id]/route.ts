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

    const product = await prisma.product.update({
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
        stockQuantity: parseInt(stockQuantity) || 0,
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

    // Soft delete - just set isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Ẩn sản phẩm thành công" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
