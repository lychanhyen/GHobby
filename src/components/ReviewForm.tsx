"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Star, Trash2, X } from "lucide-react";
import type { ExistingReview } from "@/lib/reviews";

const MAX_IMAGES = 3;
const MIN_COMMENT = 5;
const MAX_COMMENT = 1500;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
  canReview: boolean;
  existingReview: ExistingReview | null;
}

interface Feedback {
  type: "success" | "error";
  text: string;
}

export default function ReviewForm({
  productId,
  isLoggedIn,
  canReview,
  existingReview,
}: ReviewFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [images, setImages] = useState<string[]>(existingReview?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setRating(existingReview?.rating ?? 5);
    setComment(existingReview?.comment ?? "");
    setImages(existingReview?.images ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingReview?.id]);

  if (!isLoggedIn) {
    return (
      <div className="card p-5">
        <p className="text-sm font-bold text-ink-900">Bạn đã mua sản phẩm này?</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
          Đăng nhập bằng tài khoản đã đặt hàng để chia sẻ cảm nhận, chấm sao và gửi ảnh thực tế.
        </p>
        <Link href="/login" className="btn-primary mt-4 w-full">
          Đăng nhập để đánh giá
        </Link>
      </div>
    );
  }

  if (!canReview && !existingReview) {
    return (
      <div className="card p-5">
        <p className="text-sm font-bold text-ink-900">Chỉ khách đã mua hàng mới có thể đánh giá</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
          Đơn hàng của bạn cần ở trạng thái hoàn tất (hoặc pre-order đã về) để mở khoá đánh giá sản
          phẩm này.
        </p>
      </div>
    );
  }

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setFeedback(null);

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setFeedback({ type: "error", text: `Chỉ được gửi tối đa ${MAX_IMAGES} ảnh` });
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      for (const file of files) {
        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
          setFeedback({ type: "error", text: "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP" });
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setFeedback({ type: "error", text: "Mỗi ảnh không được vượt quá 5MB" });
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/reviews/upload", { method: "POST", body: formData });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          setImages((prev) => [...prev, json.data.url].slice(0, MAX_IMAGES));
        } else {
          setFeedback({ type: "error", text: json?.message || "Tải ảnh thất bại" });
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((item) => item !== url));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (comment.trim().length < MIN_COMMENT) {
      setFeedback({ type: "error", text: `Bình luận cần ít nhất ${MIN_COMMENT} ký tự` });
      return;
    }
    if (comment.trim().length > MAX_COMMENT) {
      setFeedback({ type: "error", text: `Bình luận tối đa ${MAX_COMMENT} ký tự` });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim(), images }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setFeedback({ type: "error", text: json?.message || "Gửi đánh giá thất bại" });
        return;
      }

      setFeedback({
        type: "success",
        text: existingReview ? "Đã cập nhật đánh giá của bạn" : "Cảm ơn bạn đã đánh giá sản phẩm",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Không thể kết nối, vui lòng thử lại" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    if (!window.confirm("Xoá đánh giá này?")) return;

    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/reviews/${existingReview.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setFeedback({ type: "error", text: json?.message || "Xoá đánh giá thất bại" });
        return;
      }
      setRating(5);
      setComment("");
      setImages([]);
      setFeedback({ type: "success", text: "Đã xoá đánh giá" });
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Không thể kết nối, vui lòng thử lại" });
    } finally {
      setDeleting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-ink-900">
          {existingReview ? "Đánh giá của bạn" : "Viết đánh giá"}
        </h3>
        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-700 hover:text-accent-800 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xoá đánh giá
          </button>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-bold text-ink-600">Chấm sao</p>
        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} sao`}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= activeRating ? "text-amber-500" : "text-ink-200"
                }`}
                fill="currentColor"
                strokeWidth={0}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-ink-600">{activeRating}/5</span>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="review-comment" className="text-[11px] font-bold text-ink-600">
          Bình luận
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={MAX_COMMENT}
          placeholder="Chia sẻ cảm nhận về chất lượng hộp, chi tiết, đóng gói..."
          className="input mt-1.5 resize-none"
        />
        <p className="mt-1 text-right text-[10px] text-ink-400">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-bold text-ink-600">Ảnh thực tế (tối đa {MAX_IMAGES})</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {images.map((url) => (
            <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-md border border-ink-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Ảnh đánh giá" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Xoá ảnh"
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/80 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink-300 text-[10px] font-bold text-ink-500 hover:border-ink-900 hover:text-ink-900 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploading ? "Đang tải" : "Thêm ảnh"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => uploadFiles(event.target.files)}
          />
        </div>
      </div>

      {feedback && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-accent-50 text-accent-700"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <button type="submit" disabled={submitting || uploading} className="btn-primary mt-4 w-full">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
      </button>
    </form>
  );
}
