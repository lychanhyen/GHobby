import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { handleUploadedImages } from "@/lib/upload-service";

// Ảnh phải dùng filesystem / Node APIs -> luôn chạy Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES_PER_REQUEST = 10;

export async function POST(req: NextRequest) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
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

    // Hỗ trợ cả 1 file (`file`) và nhiều file (`files`) nhưng giới hạn tổng số.
    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không có file được tải lên" },
        { status: 400 }
      );
    }
    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { success: false, message: `Mỗi lần chỉ được tải lên tối đa ${MAX_FILES_PER_REQUEST} ảnh` },
        { status: 400 }
      );
    }

    const { uploaded, failures } = await handleUploadedImages(files, MAX_FILES_PER_REQUEST);

    if (uploaded.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: failures[0]?.message || "Tải ảnh thất bại, vui lòng thử lại",
          failures,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tải lên ảnh thành công",
      data: {
        // Giữ các khoá cũ để client đang dùng `data.url` không bị vỡ.
        url: uploaded[0].url,
        path: uploaded[0].path,
        urls: uploaded.map((item) => item.url),
        files: uploaded,
      },
      failures: failures.length > 0 ? failures : undefined,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
