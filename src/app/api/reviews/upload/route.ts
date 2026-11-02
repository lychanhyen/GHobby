import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleUploadedImages } from "@/lib/upload-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (session.user.role !== "USER") {
      return NextResponse.json({ success: false, message: "Không có quyền tải ảnh" }, { status: 403 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Không đọc được dữ liệu tải lên" },
        { status: 400 }
      );
    }

    const files = [
      ...formData.getAll("file"),
      ...formData.getAll("files"),
    ].filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    const { uploaded, failures } = await handleUploadedImages(files, 1);
    if (uploaded.length === 0) {
      return NextResponse.json(
        { success: false, message: failures[0]?.message || "Tải ảnh thất bại" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { url: uploaded[0].url, urls: uploaded.map((item) => item.url) },
    });
  } catch (error) {
    console.error("Review upload error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
