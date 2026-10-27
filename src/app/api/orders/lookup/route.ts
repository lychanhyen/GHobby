import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 9) {
    return digits.slice(-9);
  }
  return digits;
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "";
    const referer = req.headers.get("referer") || "";
    const host = req.headers.get("host") || "";
    const isSameOrigin =
      (origin && host && origin.includes(host)) ||
      (referer && host && referer.includes(host)) ||
      (!origin && !referer);

    if (!isSameOrigin) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng phù hợp" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng phù hợp" }, { status: 404 });
    }

    const orderCode = typeof (body as any).orderCode === "string" ? normalizeCode((body as any).orderCode) : "";
    const phone = typeof (body as any).phone === "string" ? (body as any).phone : "";

    if (!orderCode || !phone) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng phù hợp" }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: { orderCode },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng phù hợp" }, { status: 404 });
    }

    const orderPhoneNorm = normalizePhone(order.customerPhone);
    const inputPhoneNorm = normalizePhone(phone);
    if (!orderPhoneNorm || !inputPhoneNorm || orderPhoneNorm !== inputPhoneNorm) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng phù hợp" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderCode: order.orderCode,
        token: order.viewToken,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng phù hợp" }, { status: 404 });
  }
}
