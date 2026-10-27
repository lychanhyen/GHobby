import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || "";
    const filter = searchParams.get("filter") || ""; // low, out, in

    const where: any = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (filter === "low") {
      where.productType = "IN_STOCK";
      where.stockQuantity = { gt: 0, lte: 5 };
    } else if (filter === "out") {
      where.productType = "IN_STOCK";
      where.stockQuantity = 0;
    } else if (filter === "in") {
      where.productType = "IN_STOCK";
      where.stockQuantity = { gt: 5 };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
