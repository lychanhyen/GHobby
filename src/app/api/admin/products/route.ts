import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    // Check if SKU or slug exists
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ success: false, message: "SKU đã tồn tại" }, { status: 400 });
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ success: false, message: "Sản phẩm đã tồn tại" }, { status: 400 });
    }

    const product = await prisma.product.create({
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
        preOrderCount: 0,
        imageUrl,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, message: "Tạo sản phẩm thành công", data: product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
