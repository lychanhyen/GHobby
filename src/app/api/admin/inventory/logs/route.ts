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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const productId = searchParams.get("productId") || "";
    const changeType = searchParams.get("changeType") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }
    if (changeType) {
      where.changeType = changeType;
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get inventory logs error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
