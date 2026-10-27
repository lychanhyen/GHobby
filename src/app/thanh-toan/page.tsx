"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getDepositAmount, clearCart, hasMixedCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    provinceCity: "",
    note: "",
  });

  if (items.length === 0) {
    router.push("/gio-hang");
    return null;
  }

  if (hasMixedCart()) {
    router.push("/gio-hang");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/don-hang/${data.data.orderCode}?token=${data.data.viewToken}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin giao hàng</h2>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tỉnh/Thành phố *</label>
              <input
                type="text"
                value={formData.provinceCity}
                onChange={(e) => setFormData({ ...formData, provinceCity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="VD: Đà Nẵng, TP. Hồ Chí Minh"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ giao hàng *</label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex space-x-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                    <p className="text-sm text-slate-900">{formatCurrencyVND(item.product.sellingPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền hàng</span>
                <span>{formatCurrencyVND(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold">
                <span>Tiền cọc cần thanh toán (10%)</span>
                <span>{formatCurrencyVND(getDepositAmount())}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Sau khi đặt hàng, bạn sẽ được chuyển đến trang hiển thị mã QR VietQR để thanh toán tiền cọc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
