import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const settings = await prisma.storeSetting.findMany();

    // Convert to object
    const settingsObj: any = {};
    for (const setting of settings) {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    }

    // Default values
    const defaultSettings = {
      bank_config: {
        bankId: process.env.NEXT_PUBLIC_SHOP_BANK_ID || "MB",
        bankAccount: process.env.NEXT_PUBLIC_SHOP_BANK_ACCOUNT || "",
        bankAccountName: process.env.NEXT_PUBLIC_SHOP_BANK_NAME || "",
      },
      shipping_config: {
        outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
        innerCityDistricts: (process.env.NEXT_PUBLIC_INNER_CITY_DISTRICTS || "").split(",").filter(Boolean),
      },
      general_config: {
        shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby",
        shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "",
        shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "",
        shopEmail: process.env.NEXT_PUBLIC_SHOP_EMAIL || "",
        depositPercentage: 10,
        autoCancelHours: 24,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        ...defaultSettings,
        ...settingsObj,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, message: "Thiếu key" }, { status: 400 });
    }

    await prisma.storeSetting.upsert({
      where: { key },
      update: {
        value: typeof value === "string" ? value : JSON.stringify(value),
      },
      create: {
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
      },
    });

    return NextResponse.json({ success: true, message: "Cập nhật cấu hình thành công" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
