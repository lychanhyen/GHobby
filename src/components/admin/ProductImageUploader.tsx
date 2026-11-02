"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface ProductImageUploaderProps {
  /** images[0] là ảnh chính, các phần tử sau là ảnh con. */
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

/**
 * Bộ tải ảnh sản phẩm nhiều ảnh:
 * - Ảnh đầu tiên là ảnh chính (hiển thị lớn).
 * - Các ảnh còn lại là ảnh con; bấm vào ảnh con để đặt làm ảnh chính.
 */
export default function ProductImageUploader({
  images,
  onChange,
  max = 10,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mainImage = images[0] || "";
  const subImages = images.slice(1);

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setError(null);
    const remaining = max - images.length;
    if (remaining <= 0) {
      setError(`Mỗi sản phẩm chỉ được tối đa ${max} ảnh`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    const uploadedUrls: string[] = [];
    setUploading(true);

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(`Đang tải ảnh ${index + 1}/${files.length}...`);

        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(
            `"${file.name}" không đúng định dạng. Chỉ nhận JPEG, PNG hoặc WebP (ảnh HEIC từ điện thoại cần chuyển sang JPG).`
          );
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`"${file.name}" vượt quá 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = await response.json().catch(() => null);

        if (response.ok && json?.success && json?.data?.url) {
          uploadedUrls.push(json.data.url);
        } else {
          setError(
            json?.message ||
              `Tải ảnh "${file.name}" thất bại (mã lỗi ${response.status})`
          );
        }
      }

      if (uploadedUrls.length > 0) {
        const nextImages = [...images, ...uploadedUrls].slice(0, max);
        onChange(nextImages);
      }
    } catch {
      setError("Không thể kết nối tới máy chủ khi tải ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setAsMainImage = (url: string) => {
    if (url === mainImage) return;
    const rest = images.filter((item) => item !== url);
    onChange([url, ...rest]);
  };

  const removeImage = (url: string) => {
    onChange(images.filter((item) => item !== url));
  };

  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-300 transition-colors hover:border-ink-400 hover:bg-ink-50">
          {uploading ? (
            <>
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-ink-400" />
              <p className="text-sm text-ink-500">{progress || "Đang xử lý ảnh..."}</p>
            </>
          ) : (
            <>
              <ImagePlus className="mb-3 h-9 w-9 text-ink-400" strokeWidth={1.5} />
              <p className="text-sm text-ink-500">
                <span className="font-bold text-ink-900">Nhấn để tải lên</span> hoặc kéo thả
              </p>
              <p className="mt-1 text-xs text-ink-400">
                PNG, JPG, WebP · Tối đa 5MB/ảnh · Tối đa {max} ảnh
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleSelect}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Ảnh chính */}
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative h-56 w-56 shrink-0">
              <img
                src={mainImage}
                alt="Ảnh chính sản phẩm"
                className="h-full w-full rounded-lg border border-ink-200 object-cover"
              />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-ink-950/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Ảnh chính
              </span>
              <button
                type="button"
                onClick={() => removeImage(mainImage)}
                className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-white transition-colors hover:bg-accent-600"
                aria-label="Xóa ảnh chính"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-[220px] flex-1">
              <p className="text-xs font-bold text-ink-700">Ảnh con ({subImages.length})</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                Bấm vào một ảnh con để đặt làm ảnh chính. Ảnh chính là ảnh hiển thị ở
                danh sách sản phẩm và đầu trang chi tiết.
              </p>

              <div className="mt-3 flex flex-wrap gap-2.5">
                {subImages.map((url) => (
                  <div key={url} className="relative">
                    <button
                      type="button"
                      onClick={() => setAsMainImage(url)}
                      title="Bấm để đặt làm ảnh chính"
                      className="group relative block h-20 w-20 overflow-hidden rounded-md border border-ink-200 transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500"
                    >
                      <img
                        src={url}
                        alt="Ảnh con sản phẩm"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink-950/80 px-1 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
                        Đặt làm ảnh chính
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink-950 text-white transition-colors hover:bg-accent-600"
                      aria-label="Xóa ảnh con"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {images.length < max && (
                  <label
                    className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-ink-300 text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-600 ${
                      uploading ? "pointer-events-none opacity-60" : ""
                    }`}
                    title="Thêm ảnh"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" />
                        <span className="mt-1 text-[10px] font-bold">Thêm ảnh</span>
                      </>
                    )}
                    <input
                      ref={inputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleSelect}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {uploading && progress && (
                <p className="mt-2 text-xs text-ink-500">{progress}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-accent-200 bg-accent-50 px-3 py-2 text-xs font-medium text-accent-800">
          {error}
        </p>
      )}
    </div>
  );
}
