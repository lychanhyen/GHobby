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
    const items = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: "Danh sách nhập kho trống" }, { status: 400 });
    }

    const results: any[] = [];

    for (const item of items) {
      const sku = typeof item?.sku === "string" ? item.sku.trim() : "";
      const quantity = parseInt(String(item?.quantity));
      const costPrice = item?.costPrice !== undefined && item?.costPrice !== null && item?.costPrice !== "" ? Math.max(0, parseInt(String(item.costPrice))) : undefined;
      const note = typeof item?.note === "string" ? item.note.trim() : undefined;

      if (!sku || !Number.isInteger(quantity) || quantity <= 0) {
        results.push({ sku, success: false, message: "SKU hoặc số lượng không hợp lệ" });
        continue;
      }

      if (costPrice !== undefined && (isNaN(costPrice) || costPrice < 0)) {
        results.push({ sku, success: false, message: "Giá nhập không hợp lệ" });
        continue;
      }

      try {
        const product = await prisma.product.findUnique({ where: { sku } });
        if (!product) {
          results.push({ sku, success: false, message: "Không tìm thấy sản phẩm với SKU này" });
          continue;
        }

        await prisma.$transaction(async (tx) => {
          await importStock(product.id, quantity, note || "Nhập hàng loạt", sessionData.user.id, sessionData.user.fullName, tx, costPrice);
        });

        results.push({ sku, success: true, message: "Nhập kho thành công", productName: product.name });
      } catch (error: any) {
        results.push({ sku, success: false, message: error.message || "Lỗi khi nhập kho" });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return NextResponse.json({ 
      success: successCount > 0 || failCount === 0, 
      message: `Đã nhập thành công ${successCount}/${results.length} dòng`, 
      data: results,
      summary: { successCount, failCount, total: results.length }
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, message: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}
