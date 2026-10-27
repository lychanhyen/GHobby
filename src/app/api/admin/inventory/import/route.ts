import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importStock } from "@/lib/inventory";

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
    const { productId, quantity, note, costPrice } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    const parsedCostPrice = costPrice !== undefined && costPrice !== null && costPrice !== "" ? Math.max(0, parseInt(String(costPrice))) : undefined;

    const result = await prisma.$transaction(async (tx) => {
      return await importStock(productId, parseInt(quantity), note, sessionData.user.id, sessionData.user.fullName, tx, parsedCostPrice);
    });

    return NextResponse.json({ success: true, message: "Nhập kho thành công", data: result });
  } catch (error: any) {
    console.error("Import stock error:", error);
    return NextResponse.json({ success: false, message: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}
