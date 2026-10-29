"use client";

import { useState } from "react";

export default function CancelOrderButton({ orderCode, token }: { orderCode: string; token?: string }) {
  const [loading, setLoading] = useState(false);
  const handleCancel = async () => {
    if (!confirm("Bạn chắc chắn muốn huỷ đơn? Tiền cọc sẽ không được hoàn lại.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderCode}/cancel?token=${token || ""}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      } else {
        alert(json.message || "Lỗi khi huỷ đơn");
      }
    } catch (e: any) {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handleCancel} disabled={loading} className="btn-dark px-4 py-2 text-xs font-bold">
      {loading ? "Đang huỷ..." : "Huỷ đơn (không hoàn cọc)"}
    </button>
  );
}
