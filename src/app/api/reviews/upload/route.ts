import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { processImage, generateImageFileName, getPublicUrl } from "@/lib/image-processor";

const BUCKET_NAME = "review-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function hasSupabaseStorage(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return Boolean(url && (key.startsWith("eyJ") || key.startsWith("sb_secret_")));
}

async function saveToLocalStorage(buffer: Buffer, fileName: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (session.user.role !== "USER") {
      return NextResponse.json({ success: false, message: "Không có quyền tải ảnh" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "Không có file được tải lên" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "File không được vượt quá 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const processedBuffer = await processImage(buffer);
    const fileName = generateImageFileName(file.name);

    if (!hasSupabaseStorage()) {
      const localUrl = await saveToLocalStorage(processedBuffer, fileName);
      return NextResponse.json({ success: true, data: { url: localUrl } });
    }

    try {
      const { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, processedBuffer, {
          contentType: "image/webp",
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { url: getPublicUrl(BUCKET_NAME, fileName) },
      });
    } catch (error) {
      console.error("Supabase review upload error, falling back to local storage:", error);
      const localUrl = await saveToLocalStorage(processedBuffer, fileName);
      return NextResponse.json({ success: true, data: { url: localUrl } });
    }
  } catch (error) {
    console.error("Review upload error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
