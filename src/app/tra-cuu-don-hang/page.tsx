"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function OrderLookupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    orderCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For simplicity, just redirect to order page
      // In production, should verify phone
      router.push(`/don-hang/${formData.orderCode}`);
    } catch (err) {
      setError("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Tra cứu đơn hàng</h1>
        <p className="text-slate-600">Nhập mã đơn hàng để theo dõi trạng thái</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mã đơn hàng</label>
            <input
              type="text"
              value={formData.orderCode}
              onChange={(e) => setFormData({ ...formData, orderCode: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="VD: GH-ABC123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập số điện thoại đã đặt hàng"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Đang tìm..." : "Tra cứu"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
