"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";

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
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: formData.orderCode,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.orderCode && data.data?.token) {
        router.push(`/don-hang/${data.data.orderCode}?token=${encodeURIComponent(data.data.token)}`);
        return;
      }
      setError(data.message || "Không tìm thấy đơn hàng phù hợp");
    } catch (err) {
      setError("Không tìm thấy đơn hàng phù hợp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 bg-white">
            <PackageSearch className="h-5 w-5 text-ink-600" />
          </span>
          <p className="eyebrow mt-4">Hỗ trợ</p>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Tra cứu đơn hàng
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Nhập mã đơn hàng để theo dõi trạng thái
          </p>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="orderCode" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Mã đơn hàng
              </label>
              <input
                id="orderCode"
                type="text"
                value={formData.orderCode}
                onChange={(e) => setFormData({ ...formData, orderCode: e.target.value.toUpperCase() })}
                className="input font-mono uppercase placeholder:font-sans"
                placeholder="VD: GH-ABC123"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="lookupPhone" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Số điện thoại
              </label>
              <input
                id="lookupPhone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="Nhập số điện thoại đã đặt hàng"
                autoComplete="tel"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-dark h-11 w-full gap-2 px-5">
              <Search className="h-4 w-4" />
              <span>{loading ? "Đang tìm..." : "Tra cứu"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
