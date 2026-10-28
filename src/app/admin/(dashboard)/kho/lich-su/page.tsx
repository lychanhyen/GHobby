"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

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
      return (
        <span className="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          Nhập
        </span>
      );
    }
    if (type === "POS_SALE" || type === "EXPORT_MANUAL") {
      return (
        <span className="inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          Bán tại quán
        </span>
      );
    }
    if (type === "ONLINE_SALE" || type === "ORDER_DEDUCT") {
      return (
        <span className="inline-flex items-center rounded-sm border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-bold text-ink-700">
          Đơn online
        </span>
      );
    }
    if (type === "ORDER_CANCEL_RESTOCK") {
      return (
        <span className="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          Hoàn kho
        </span>
      );
    }
    if (type === "MANUAL_ADJUST" || type === "ADJUST") {
      return (
        <span className="inline-flex items-center rounded-sm border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-[11px] font-bold text-yellow-700">
          Điều chỉnh
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-sm border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-bold text-ink-600">
        {getChangeTypeLabel(type)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/kho"
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition-colors hover:border-ink-300 hover:bg-white hover:text-ink-900"
            aria-label="Quay lại quản lý kho"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="eyebrow">Kho hàng</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
              Lịch Sử Biến Động Kho
            </h1>
            <p className="mt-1 text-sm text-ink-500">Theo dõi tất cả thay đổi tồn kho</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input sm:max-w-xs"
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
      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-ink-300" strokeWidth={1.5} />
            <p className="text-sm font-bold text-ink-900">Chưa có bản ghi nào</p>
            <p className="mt-1 text-sm text-ink-500">Biến động kho sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Số lượng</th>
                  <th className="px-4 py-3 text-left">Tồn sau</th>
                  <th className="px-4 py-3 text-left">Người thực hiện</th>
                  <th className="px-4 py-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ink-50/70">
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink-600">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={log.product?.imageUrl}
                          alt={log.product?.name}
                          className="h-8 w-8 shrink-0 rounded-md border border-ink-100 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink-900">{log.product?.name}</p>
                          <p className="truncate font-mono text-[11px] text-ink-500">{log.product?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">{getChangeTypeBadge(log.changeType)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-sm font-bold ${
                          log.quantityChange > 0
                            ? "text-emerald-700"
                            : log.quantityChange < 0
                              ? "text-accent-700"
                              : "text-ink-600"
                        }`}
                      >
                        {log.quantityChange > 0 ? "+" : ""}
                        {log.quantityChange}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-ink-900">{log.stockAfter}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{log.performedBy}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{log.note || "-"}</td>
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
