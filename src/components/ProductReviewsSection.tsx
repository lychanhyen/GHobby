import { getSession } from "@/lib/auth";
import {
  getReviewEligibility,
  type ExistingReview,
  type ReviewItem,
  type ReviewSummary,
} from "@/lib/reviews";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";

interface ProductReviewsSectionProps {
  productId: string;
  summary: ReviewSummary;
  reviews: ReviewItem[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ProductReviewsSection({
  productId,
  summary,
  reviews,
}: ProductReviewsSectionProps) {
  const session = await getSession();
  const isLoggedIn = session?.user?.role === "USER";

  let canReview = false;
  let existingReview: ExistingReview | null = null;
  if (isLoggedIn && session?.user?.id) {
    const eligibility = await getReviewEligibility(session.user.id, productId);
    canReview = eligibility.hasPurchased;
    existingReview = eligibility.existingReview;
  }

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink-200 pb-4">
        <div>
          <p className="eyebrow">Cảm nhận khách hàng</p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Đánh giá sản phẩm
          </h2>
        </div>
        <p className="hidden text-xs text-ink-500 sm:block">{summary.total} đánh giá</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold leading-none tracking-tight text-ink-950">
                {summary.total > 0 ? summary.average.toFixed(1) : "—"}
              </span>
              <div className="pb-0.5">
                <StarRating value={summary.average} size="md" />
                <p className="mt-1 text-[11px] text-ink-500">
                  {summary.total > 0 ? `${summary.total} đánh giá` : "Chưa có đánh giá"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
                const percent = summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-[11px] text-ink-500">
                    <span className="w-2.5 text-right font-medium">{star}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <span
                        className="block h-full rounded-full bg-amber-500"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ReviewForm
            productId={productId}
            isLoggedIn={isLoggedIn}
            canReview={canReview}
            existingReview={existingReview}
          />
        </div>

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm font-bold text-ink-800">Chưa có đánh giá nào</p>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-ink-500">
                Những khách đã mua sản phẩm này có thể chia sẻ cảm nhận, chấm sao và gửi ảnh thực
                tế tại đây.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold uppercase text-ink-700">
                      {review.userName.trim().charAt(0) || "K"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{review.userName}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <StarRating value={review.rating} />
                        <span className="text-[11px] text-ink-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.verifiedPurchase && (
                    <span className="shrink-0 rounded-sm bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      Đã mua hàng
                    </span>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                  {review.comment}
                </p>

                {review.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-20 w-20 overflow-hidden rounded-md border border-ink-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Ảnh đánh giá của ${review.userName}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
