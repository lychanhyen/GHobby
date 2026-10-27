import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
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

    await revokeSession();
    return NextResponse.json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
