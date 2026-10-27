import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getSession();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: sessionData.user.id,
          username: sessionData.user.username,
          fullName: sessionData.user.fullName,
          phone: sessionData.user.phone,
          city: sessionData.user.city,
          role: sessionData.user.role,
          mustChangePassword: sessionData.user.mustChangePassword,
        },
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
