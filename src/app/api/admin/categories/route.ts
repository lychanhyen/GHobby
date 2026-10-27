import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Tên danh mục không được để trống" }, { status: 400 });
    }

    const slug = slugify(name);

    // Check if slug exists
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Danh mục đã tồn tại" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, message: "Tạo danh mục thành công", data: category });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
