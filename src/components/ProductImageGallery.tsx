"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

interface ProductImageGalleryProps {
  /** Ảnh đầu tiên là ảnh chính, các ảnh sau là ảnh con. */
  images: string[];
  alt: string;
  /** Huy hiệu/tình trạng hiển thị đè lên ảnh chính. */
  overlay?: React.ReactNode;
  priority?: boolean;
}

/**
 * Thư viện ảnh trang chi tiết sản phẩm.
 * Bấm vào ảnh con (thumbnail) để đổi ảnh chính đang hiển thị.
 * Ảnh lỗi/404 được loại khỏi danh sách thay vì để trình duyệt log lỗi.
 */
export default function ProductImageGallery({
  images,
  alt,
  overlay,
  priority = true,
}: ProductImageGalleryProps) {
  const gallery = useMemo(() => {
    const unique: string[] = [];
    for (const url of images) {
      if (url && !unique.includes(url)) unique.push(url);
    }
    return unique;
  }, [images]);

  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [activeUrl, setActiveUrl] = useState<string>(gallery[0] || "");

  const visibleImages = useMemo(
    () => gallery.filter((url) => !brokenImages.includes(url)),
    [gallery, brokenImages]
  );

  useEffect(() => {
    if (!visibleImages.includes(activeUrl)) {
      setActiveUrl(visibleImages[0] || "");
    }
  }, [visibleImages, activeUrl]);

  const markBroken = (url: string) => {
    setBrokenImages((current) =>
      current.includes(url) ? current : [...current, url]
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
        {activeUrl ? (
          <Image
            key={activeUrl}
            src={activeUrl}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => markBroken(activeUrl)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-400">
            <ImageOff className="h-8 w-8" strokeWidth={1.5} />
            <span className="text-xs font-medium">Chưa có ảnh sản phẩm</span>
          </div>
        )}
        {activeUrl && overlay}
      </div>

      {visibleImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {visibleImages.map((url, index) => {
            const isActive = url === activeUrl;
            return (
              <button
                key={url}
                type="button"
                onClick={() => setActiveUrl(url)}
                aria-label={`Xem ảnh ${index + 1}${index === 0 ? " (ảnh chính)" : ""}`}
                aria-pressed={isActive}
                title={index === 0 ? "Ảnh chính" : `Ảnh ${index + 1}`}
                className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                  isActive ? "border-accent-600" : "border-ink-200 hover:border-ink-400"
                }`}
              >
                <Image
                  src={url}
                  alt={`${alt} - ảnh ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  onError={() => markBroken(url)}
                />
                {index === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-ink-950/80 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-white">
                    Ảnh chính
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
