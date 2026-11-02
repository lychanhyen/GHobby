import { NextRequest, NextResponse } from "next/server";
import { readStoredImage, sanitizeUploadFileName } from "@/lib/upload-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Phục vụ ảnh tải lên tại /uploads/<file>.
 *
 * Next.js chỉ phục vụ các file có sẵn trong `public/` tại thời điểm build, nên ảnh
 * được ghi vào `public/uploads` lúc chạy (hoặc được lưu trong DB khi filesystem
 * chỉ đọc như trên Vercel) sẽ bị 404 nếu không có route này. Route này là lớp dự
 * phòng: file tĩnh có sẵn vẫn do Next phục vụ trước, chỉ ảnh mới/ảnh trong DB mới
 * đi vào đây.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const fileName = sanitizeUploadFileName((segments || []).join("/"));

  if (!fileName) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stored = await readStoredImage(fileName);
  if (!stored) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(stored.data), {
    status: 200,
    headers: {
      "Content-Type": stored.mimeType,
      "Content-Length": String(stored.data.byteLength),
      // Tên file là UUID bất biến -> cache vĩnh viễn.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
