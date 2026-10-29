import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: [] });
    }
    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      success: true,
      data: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        product: i.product,
        createdAt: i.createdAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { productId } = await req.json();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Cần đăng nhập" }, { status: 401 });
    }
    if (!productId) {
      return NextResponse.json({ success: false, message: "Thiếu productId" }, { status: 400 });
    }

    const existing = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, productId },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed" });
    }

    await prisma.wishlist.create({
      data: { userId: session.user.id, productId },
    });
    return NextResponse.json({ success: true, action: "added" });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
