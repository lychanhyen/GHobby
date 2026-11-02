import { prisma } from "./prisma";

export const REVIEW_MIN_COMMENT = 5;
export const REVIEW_MAX_COMMENT = 1500;
export const REVIEW_MAX_IMAGES = 3;
export const REVIEW_PAGE_SIZE = 20;

// Đơn được coi là "đã mua" để được đánh giá
export const REVIEW_PURCHASE_STATUSES = ["COMPLETED", "PREORDER_ARRIVED"] as const;

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export interface ProductRatingSummary {
  average: number;
  total: number;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  userName: string;
  verifiedPurchase: boolean;
}

export interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
  images: string[];
}

const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  total: 0,
  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

export async function getProductReviewSummary(productId: string): Promise<ReviewSummary> {
  try {
    const [aggregate, groups] = await Promise.all([
      prisma.review.aggregate({
        where: { productId, isVisible: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId, isVisible: true },
        _count: { _all: true },
      }),
    ]);

    const distribution = { ...EMPTY_SUMMARY.distribution };
    for (const group of groups) {
      const key = group.rating as 1 | 2 | 3 | 4 | 5;
      if (key >= 1 && key <= 5) {
        distribution[key] = group._count._all;
      }
    }

    const average = aggregate._avg.rating
      ? Math.round(aggregate._avg.rating * 10) / 10
      : 0;

    return { average, total: aggregate._count._all, distribution };
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Database Error] Failed to fetch review summary:", error);
    }
    return EMPTY_SUMMARY;
  }
}

// Lấy nhanh điểm trung bình + số đánh giá cho nhiều sản phẩm (dùng cho danh sách/trang chủ)
export async function getProductReviewSummaries(
  productIds: string[]
): Promise<Record<string, ProductRatingSummary>> {
  if (productIds.length === 0) return {};

  try {
    const groups = await prisma.review.groupBy({
      by: ["productId", "rating"],
      where: { productId: { in: productIds }, isVisible: true },
      _count: { _all: true },
    });

    const totals: Record<string, { sum: number; total: number }> = {};
    for (const group of groups) {
      const entry = totals[group.productId] || { sum: 0, total: 0 };
      entry.sum += group.rating * group._count._all;
      entry.total += group._count._all;
      totals[group.productId] = entry;
    }

    const summaries: Record<string, ProductRatingSummary> = {};
    for (const [productId, entry] of Object.entries(totals)) {
      summaries[productId] = {
        average: entry.total > 0 ? Math.round((entry.sum / entry.total) * 10) / 10 : 0,
        total: entry.total,
      };
    }
    return summaries;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Database Error] Failed to fetch product review summaries:", error);
    }
    return {};
  }
}

export async function getProductReviews(
  productId: string,
  limit = REVIEW_PAGE_SIZE
): Promise<ReviewItem[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId, isVisible: true },
      include: {
        user: { select: { fullName: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      createdAt: review.createdAt.toISOString(),
      userName: review.user.fullName || review.user.username,
      verifiedPurchase: Boolean(review.orderId),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Database Error] Failed to fetch product reviews:", error);
    }
    return [];
  }
}

export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  try {
    const item = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: [...REVIEW_PURCHASE_STATUSES] },
        },
      },
      select: { id: true },
    });
    return Boolean(item);
  } catch {
    return false;
  }
}

export async function getExistingReview(
  userId: string,
  productId: string
): Promise<ExistingReview | null> {
  try {
    const review = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true, rating: true, comment: true, images: true },
    });
    return review;
  } catch {
    return null;
  }
}

export async function getReviewEligibility(userId: string, productId: string) {
  const [hasPurchased, existingReview] = await Promise.all([
    hasPurchasedProduct(userId, productId),
    getExistingReview(userId, productId),
  ]);
  return { hasPurchased, existingReview };
}
