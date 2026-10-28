"use client";

import { useState } from "react";
import { CartItem, useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle, ArrowRight } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { getProductCartLimit } from "@/lib/cart";

export default function CartPage() {
  const { items, isHydrated, removeItem, updateQuantity, getTotalPrice, getDepositAmount, hasMixedCart, clearCart } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="container-page py-16 text-center text-sm text-ink-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink-200 bg-white">
            <ShoppingBag className="h-6 w-6 text-ink-400" />
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Giỏ hàng trống
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link href="/" className="btn-dark mt-6 px-5">
            Tiếp tục mua sắm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleIncrease = (item: CartItem) => {
    const maxQuantity = getProductCartLimit(item.product);

    if (item.quantity >= maxQuantity) {
      setMessage(
        item.product.productType === "IN_STOCK"
          ? `Không thể tăng số lượng "${item.product.name}": tồn kho hiện tại ${item.product.stockQuantity} hộp và mỗi sản phẩm chỉ được đặt tối đa 3 hộp.`
          : `Không thể tăng số lượng "${item.product.name}": chỉ còn ${maxQuantity} suất pre-order.`
      );
      return;
    }

    setMessage(null);
    updateQuantity(item.product.id, item.quantity + 1);
  };

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Giỏ hàng</p>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Giỏ hàng của bạn
          </h1>
        </div>
        <p className="text-xs text-ink-500">{items.length} sản phẩm</p>
      </div>

      {message && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-3.5 text-sm font-medium leading-relaxed text-amber-800"
        >
          {message}
        </div>
      )}

      {hasMixedCart() && (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-800">Cảnh báo: Giỏ hàng hỗn hợp</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-700">
              Giỏ hàng của bạn chứa cả sản phẩm có sẵn và Pre-order. Theo quy định, vui lòng thanh toán riêng từng đơn hàng.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Cart Items */}
        <div className="divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3.5 p-3.5 sm:gap-4 sm:p-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-20 w-20 shrink-0 rounded-md border border-ink-100 bg-ink-50 object-cover sm:h-24 sm:w-24"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/san-pham/${item.product.slug}`}
                      className="line-clamp-2 text-sm font-bold leading-snug text-ink-950 transition-colors duration-200 hover:text-accent-700 sm:text-[15px]"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-500">{item.product.brand}</p>
                    <span
                      className={`mt-1.5 inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        item.product.productType === "PRE_ORDER"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.product.productType === "PRE_ORDER" ? "Pre-order" : "Có sẵn"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Bạn chắc chắn muốn xóa "${item.product.name}" khỏi giỏ hàng?`
                        )
                      ) {
                        removeItem(item.product.id);
                      }
                    }}
                    aria-label={`Xóa ${item.product.name} khỏi giỏ hàng`}
                    className="-mr-1.5 -mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors duration-200 hover:bg-accent-50 hover:text-accent-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
                  <div className="inline-flex overflow-hidden rounded-md border border-ink-200 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage(null);
                        updateQuantity(item.product.id, item.quantity - 1);
                      }}
                      aria-label="Giảm số lượng"
                      className="inline-flex h-8 w-8 items-center justify-center text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-950"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex w-9 items-center justify-center border-x border-ink-200 text-xs font-bold tabular-nums text-ink-950">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item)}
                      aria-label="Tăng số lượng"
                      className="inline-flex h-8 w-8 items-center justify-center text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-950"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-ink-950">
                      {formatCurrencyVND(item.product.sellingPrice * item.quantity)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-500">
                      {formatCurrencyVND(item.product.sellingPrice)} / sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <h2 className="text-base font-bold text-ink-950">Tóm tắt đơn hàng</h2>

            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3 text-ink-600">
                <span>Tạm tính</span>
                <span className="font-medium text-ink-900">{formatCurrencyVND(getTotalPrice())}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-ink-600">
                <span>Tiền cọc (10%)</span>
                <span className="font-bold text-amber-700">{formatCurrencyVND(getDepositAmount())}</span>
              </div>
              <div className="flex items-end justify-between gap-3 border-t border-ink-200 pt-3">
                <span className="text-sm font-bold text-ink-900">Tổng tiền hàng</span>
                <span className="text-xl font-bold leading-none tracking-tight text-ink-950">
                  {formatCurrencyVND(getTotalPrice())}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              * Phí vận chuyển sẽ được thông báo sau hoặc tính theo khu vực giao hàng
            </p>

            <Link
              href="/thanh-toan"
              className={`mt-4 inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-bold transition-colors duration-200 ${
                hasMixedCart()
                  ? "cursor-not-allowed bg-ink-200 text-ink-400"
                  : "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800"
              }`}
              onClick={(e) => {
                if (hasMixedCart()) {
                  e.preventDefault();
                  setMessage("Không thể thanh toán đơn hỗn hợp. Vui lòng tách thành 2 đơn riêng biệt.");
                }
              }}
            >
              Tiến hành thanh toán
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-ink-500 transition-colors duration-200 hover:bg-ink-50 hover:text-accent-700"
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
