import { NextRequest, NextResponse } from "next/server";
import { Prisma, InventoryChangeType } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsedPage = parseInt(searchParams.get("page") || "1");
    const parsedLimit = parseInt(searchParams.get("limit") || "50");
    const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
    const limit = Number.isFinite(parsedLimit) ? Math.min(200, Math.max(1, parsedLimit)) : 50;
    const productId = searchParams.get("productId") || "";
    const changeType = searchParams.get("changeType") || "";
    const search = searchParams.get("search")?.trim() || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const skip = (page - 1) * limit;

    // Gom các loại cũ vào cùng nhóm để bộ lọc hoạt động xuyên suốt dữ liệu lịch sử
    const changeTypeGroups: Record<string, InventoryChangeType[]> = {
      POS_SALE: ["POS_SALE", "EXPORT_MANUAL"],
      ONLINE_SALE: ["ONLINE_SALE", "ORDER_DEDUCT"],
      RESTOCK: ["RESTOCK", "IMPORT", "ORDER_CANCEL_RESTOCK"],
      MANUAL_ADJUST: ["MANUAL_ADJUST", "ADJUST"],
    };
    const validChangeTypes = new Set<string>(Object.values(InventoryChangeType));

    const where: Prisma.InventoryLogWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (changeType) {
      const groupedTypes = changeTypeGroups[changeType];
      if (groupedTypes) {
        where.changeType = { in: groupedTypes };
      } else if (validChangeTypes.has(changeType)) {
        where.changeType = changeType as InventoryChangeType;
      } else {
        // Loại giao dịch không hợp lệ => không trả về bản ghi nào
        where.changeType = { in: [] };
      }
    }

    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(`${from}T00:00:00`);
      }
      if (to) {
        where.createdAt.lte = new Date(`${to}T23:59:59.999`);
      }
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
          order: {
            select: {
              orderCode: true,
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
