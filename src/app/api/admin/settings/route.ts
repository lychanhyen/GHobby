import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDefaultShippingMethods } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
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
        expressRadiusKm: Number(process.env.NEXT_PUBLIC_EXPRESS_RADIUS_KM) || 3,
        shippingMethods: buildDefaultShippingMethods({
          outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
          expressRadiusKm: Number(process.env.NEXT_PUBLIC_EXPRESS_RADIUS_KM) || 3,
        }),
      },
      general_config: {
        shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby",
        shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "",
        shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "",
        shopEmail: process.env.NEXT_PUBLIC_SHOP_EMAIL || "",
        depositPercentage: 10,
        autoCancelHours: 24,
      },
      homepage_config: {
        brandTagline: "Gunpla & Figure",
        heroEyebrow: "Bandai Spirits · Kotobukiya · Chính hãng",
        heroTitle: "Mô hình chính hãng cho người yêu",
        heroHighlight: "từng chi tiết",
        heroDescription:
          "Gunpla Bandai, figure anime và dụng cụ lắp ráp — chọn kỹ từng sản phẩm, đóng gói cẩn thận, giao đúng hẹn trên toàn quốc.",
        heroBadges: ["HG · RG · MG · PG", "Cọc 10%", "Đóng gói 5 lớp"],
        heroImageUrl: "",
        heroSecondaryImageUrl: "",
        heroSlots: [
          { mode: "auto", productId: "" },
          { mode: "auto", productId: "" },
          { mode: "auto", productId: "" },
        ],
      },
      header_config: {
        categoryIds: [],
        limit: 6,
      },
    };

    const homepageConfig = {
      ...defaultSettings.homepage_config,
      ...(settingsObj.homepage_config && typeof settingsObj.homepage_config === "object"
        ? settingsObj.homepage_config
        : {}),
    };

    const shippingConfig: any = {
      ...defaultSettings.shipping_config,
      ...(settingsObj.shipping_config && typeof settingsObj.shipping_config === "object"
        ? settingsObj.shipping_config
        : {}),
    };
    if (
      !Array.isArray(shippingConfig.shippingMethods) ||
      shippingConfig.shippingMethods.length === 0
    ) {
      shippingConfig.shippingMethods = buildDefaultShippingMethods(shippingConfig);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...defaultSettings,
        ...settingsObj,
        homepage_config: homepageConfig,
        shipping_config: shippingConfig,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
