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
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {isPreOrder
            ? "Mẫu mô hình này hiện đã hết suất pre-order."
            : "Mẫu mô hình này hiện tạm thời hết hàng."}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Bạn vui lòng tham khảo các mẫu kit tương tự được gợi ý ngay bên dưới!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasDifferentType && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Giỏ hàng đang có sản phẩm khác loại (có sẵn / pre-order). Vui lòng tách thành 2 đơn
          riêng biệt trước khi thêm sản phẩm này.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-700">Số lượng:</span>
        <div className="inline-flex items-center rounded-lg border border-slate-300 overflow-hidden">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={quantity >= maxQuantity}
            aria-label="Tăng số lượng"
            className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-slate-500">
          Tối đa {maxQuantity} sản phẩm {isPreOrder ? "(suất pre-order còn lại)" : "(tồn kho hiện tại)"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => handlePurchase(false)}
          disabled={!isHydrated}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-center border-2 border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Thêm vào giỏ hàng</span>
        </button>
        <button
          type="button"
          onClick={() => handlePurchase(true)}
          disabled={!isHydrated}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-center bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-900/30"
        >
          {isPreOrder ? "Đặt Cọc Pre-Order Ngay (10%)" : "Mua Ngay (Cọc 10%)"}
        </button>
      </div>

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm font-medium ${
            feedback.type === "success" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
