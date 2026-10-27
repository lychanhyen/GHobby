"use client";

import { useState } from "react";
import { CartItem, useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { getProductCartLimit } from "@/lib/cart";

export default function CartPage() {
  const { items, isHydrated, removeItem, updateQuantity, getTotalPrice, getDepositAmount, hasMixedCart, clearCart } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-600">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h1>
          <p className="text-slate-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
          >
            Tiếp tục mua sắm
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Giỏ hàng của bạn</h1>

      {message && (
        <div
          role="alert"
          className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm font-medium text-amber-800"
        >
          {message}
        </div>
      )}

      {hasMixedCart() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Cảnh báo: Giỏ hàng hỗn hợp</p>
            <p className="text-sm text-amber-700 mt-1">
              Giỏ hàng của bạn chứa cả sản phẩm có sẵn và Pre-order. Theo quy định, vui lòng thanh toán riêng từng đơn hàng.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-xl border border-slate-200 p-4 flex space-x-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-2">
                  <div>
                    <Link
                      href={`/san-pham/${item.product.slug}`}
                      className="font-bold text-slate-900 hover:text-red-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-slate-500">{item.product.brand}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.product.productType === "PRE_ORDER"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.product.productType === "PRE_ORDER" ? "Pre-order" : "Có sẵn"}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setMessage(null);
                        updateQuantity(item.product.id, item.quantity - 1);
                      }}
                      className="p-1 rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="p-1 rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrencyVND(item.product.sellingPrice * item.quantity)}</p>
                    <p className="text-xs text-slate-500">{formatCurrencyVND(item.product.sellingPrice)} / sản phẩm</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span>{formatCurrencyVND(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tiền cọc (10%)</span>
                <span className="font-bold text-red-600">{formatCurrencyVND(getDepositAmount())}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between">
                <span className="font-bold text-slate-900">Tổng tiền hàng</span>
                <span className="font-bold text-slate-900">{formatCurrencyVND(getTotalPrice())}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              * Phí vận chuyển sẽ được thông báo sau hoặc tính theo khu vực giao hàng
            </p>
            <Link
              href="/thanh-toan"
              className={`block w-full py-3 rounded-lg text-center font-bold transition-colors ${
                hasMixedCart()
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-500"
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
              onClick={clearCart}
              className="w-full mt-2 py-2 text-sm text-slate-600 hover:text-red-600 transition-colors"
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
