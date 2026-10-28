"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { getProductCartLimit } from "@/lib/cart";

interface ProductPurchaseActionsProps {
  product: Product;
}

interface Feedback {
  type: "success" | "error";
  text: string;
}

export default function ProductPurchaseActions({ product }: ProductPurchaseActionsProps) {
  const router = useRouter();
  const { addItem, items, isHydrated } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const isPreOrder = product.productType === "PRE_ORDER";
  const maxQuantity = getProductCartLimit(product);
  const isUnavailable = maxQuantity <= 0;
  const hasDifferentType = items.some(
    (item) => item.product.productType !== product.productType
  );

  const changeQuantity = (delta: number) => {
    setFeedback(null);
    setQuantity((current) => Math.min(Math.max(1, current + delta), Math.max(1, maxQuantity)));
  };

  const handlePurchase = (goToCheckout: boolean) => {
    const result = addItem(product, quantity);

    if (!result.ok) {
      setFeedback({ type: "error", text: result.message || "Không thể thêm sản phẩm vào giỏ hàng" });
      return;
    }

    if (goToCheckout) {
      router.push("/thanh-toan");
      return;
    }

    setFeedback({
      type: "success",
      text: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
    });
  };

  if (isUnavailable) {
    return (
      <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
        <p className="text-sm font-bold text-ink-800">
          {isPreOrder
            ? "Mẫu mô hình này hiện đã hết suất pre-order."
            : "Mẫu mô hình này hiện tạm thời hết hàng."}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          Bạn vui lòng tham khảo các mẫu kit tương tự được gợi ý ngay bên dưới!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasDifferentType && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
          Giỏ hàng đang có sản phẩm khác loại (có sẵn / pre-order). Vui lòng tách thành 2 đơn
          riêng biệt trước khi thêm sản phẩm này.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[13px] font-bold text-ink-800">Số lượng</span>
        <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-ink-200 bg-white">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="inline-flex h-10 w-10 items-center justify-center text-ink-600 transition-colors duration-200 hover:bg-ink-50 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold tabular-nums text-ink-950">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={quantity >= maxQuantity}
            aria-label="Tăng số lượng"
            className="inline-flex h-10 w-10 items-center justify-center text-ink-600 transition-colors duration-200 hover:bg-ink-50 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs leading-relaxed text-ink-500">
          Tối đa {maxQuantity} sản phẩm {isPreOrder ? "(suất pre-order còn lại)" : "(tồn kho hiện tại)"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => handlePurchase(false)}
          disabled={!isHydrated}
          className="btn-outline h-11 flex-1 gap-2 px-5"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Thêm vào giỏ hàng</span>
        </button>
        <button
          type="button"
          onClick={() => handlePurchase(true)}
          disabled={!isHydrated}
          className="btn-primary h-11 flex-1 px-5"
        >
          {isPreOrder ? "Đặt Cọc Pre-Order Ngay (10%)" : "Mua Ngay (Cọc 10%)"}
        </button>
      </div>

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm font-medium ${
            feedback.type === "success" ? "text-emerald-700" : "text-accent-700"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
