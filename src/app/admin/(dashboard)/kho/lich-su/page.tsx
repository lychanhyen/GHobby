"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

export default function InventoryLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter && { changeType: filter }),
      });
      const res = await fetch(`/api/admin/inventory/logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeLabel = (type: string) => {
    const labels: any = {
      POS_SALE: "Bán tại cửa hàng",
      ONLINE_SALE: "Đơn online",
      MANUAL_ADJUST: "Chỉnh thủ công",
      RESTOCK: "Nhập kho",
      IMPORT: "Nhập kho",
      EXPORT_MANUAL: "Xuất thủ công",
      ORDER_DEDUCT: "Trừ kho đơn hàng",
      ORDER_CANCEL_RESTOCK: "Hoàn kho",
      ADJUST: "Điều chỉnh",
      DAMAGED: "Hàng hỏng",
      WARRANTY: "Bảo hành",
    };
    return labels[type] || type;
  };

  const getChangeTypeBadge = (type: string) => {
    if (type === "RESTOCK" || type === "IMPORT") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Nhập</span>;
    }
    if (type === "POS_SALE" || type === "EXPORT_MANUAL") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Bán tại quán</span>;
    }
    if (type === "ONLINE_SALE" || type === "ORDER_DEDUCT") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Đơn online</span>;
    }
    if (type === "ORDER_CANCEL_RESTOCK") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Hoàn kho</span>;
    }
    if (type === "MANUAL_ADJUST" || type === "ADJUST") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Điều chỉnh</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{getChangeTypeLabel(type)}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/kho"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Lịch Sử Biến Động Kho</h1>
            <p className="text-slate-600 mt-1">Theo dõi tất cả thay đổi tồn kho</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Tất cả loại biến động</option>
          <option value="POS_SALE">Bán tại quán</option>
          <option value="ONLINE_SALE">Đơn online</option>
          <option value="RESTOCK">Nhập kho / Hoàn kho</option>
          <option value="MANUAL_ADJUST">Chỉnh thủ công</option>
          <option value="DAMAGED">Hàng hỏng</option>
          <option value="WARRANTY">Bảo hành</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Thời gian</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Sản phẩm</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Loại</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Số lượng</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tồn sau</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Người thực hiện</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={log.product?.imageUrl}
                          alt={log.product?.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.product?.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{log.product?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getChangeTypeBadge(log.changeType)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${log.quantityChange > 0 ? "text-green-600" : log.quantityChange < 0 ? "text-red-600" : "text-slate-600"}`}>
                        {log.quantityChange > 0 ? "+" : ""}{log.quantityChange}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{log.stockAfter}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.performedBy}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
