"use client";

import { useEffect, useState } from "react";
import {
  History,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package,
  CalendarDays,
} from "lucide-react";

interface InventoryLogRow {
  id: string;
  changeType: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  note: string | null;
  performedBy: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    imageUrl: string;
  } | null;
  order: {
    orderCode: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AppliedFilters {
  search: string;
  changeType: string;
  fromDate: string;
  toDate: string;
}

const EMPTY_FILTERS: AppliedFilters = {
  search: "",
  changeType: "",
  fromDate: "",
  toDate: "",
};

const TYPE_OPTIONS = [
  { value: "POS_SALE", label: "Bán tại quán" },
  { value: "ONLINE_SALE", label: "Đơn online" },
  { value: "RESTOCK", label: "Nhập kho / Hoàn kho" },
  { value: "MANUAL_ADJUST", label: "Chỉnh thủ công" },
  { value: "DAMAGED", label: "Hàng hỏng" },
  { value: "WARRANTY", label: "Bảo hành" },
];

function getTypeBadge(type: string) {
  switch (type) {
    case "POS_SALE":
    case "EXPORT_MANUAL":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
          Bán tại quán
        </span>
      );
    case "ONLINE_SALE":
    case "ORDER_DEDUCT":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
          Đơn online
        </span>
      );
    case "RESTOCK":
    case "IMPORT":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          Nhập kho
        </span>
      );
    case "ORDER_CANCEL_RESTOCK":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Hoàn kho
        </span>
      );
    case "MANUAL_ADJUST":
    case "ADJUST":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
          Chỉnh thủ công
        </span>
      );
    case "DAMAGED":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          Hàng hỏng
        </span>
      );
    case "WARRANTY":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
          Bảo hành
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {type}
        </span>
      );
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export default function InventoryAuditLogPage() {
  const [logs, setLogs] = useState<InventoryLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [changeType, setChangeType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [applied, setApplied] = useState<AppliedFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit),
        });

        if (applied.search) params.set("search", applied.search);
        if (applied.changeType) params.set("changeType", applied.changeType);
        if (applied.fromDate) params.set("from", applied.fromDate);
        if (applied.toDate) params.set("to", applied.toDate);

        const res = await fetch(`/api/admin/inventory/logs?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (cancelled) return;

        if (data.success) {
          setLogs(data.data.logs);
          setPagination((prev) => ({ ...prev, ...data.data.pagination }));
        } else {
          setError(data.message || "Không tải được nhật ký kho");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Có lỗi xảy ra khi tải nhật ký kho");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      cancelled = true;
    };
  }, [applied, page, pagination.limit]);

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault();

    if (fromDate && toDate && fromDate > toDate) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setError("");
    setPage(1);
    setApplied({
      search: search.trim(),
      changeType,
      fromDate,
      toDate,
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setChangeType("");
    setFromDate("");
    setToDate("");
    setPage(1);
    setApplied({ ...EMPTY_FILTERS });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <History className="w-6 h-6 text-red-600" />
            <span>Nhật Ký Biến Động Kho</span>
          </h1>
          <p className="text-slate-600 mt-1">
            Minh bạch lịch sử xuất/nhập kho và mọi thay đổi tồn kho
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-2">
          <Package className="w-5 h-5" />
          <span className="font-bold">
            {loading ? "Đang tải..." : `${pagination.total} bản ghi`}
          </span>
        </div>
      </div>

      {/* Bộ lọc */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="xl:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Tìm sản phẩm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Loại giao dịch</label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Tất cả loại giao dịch</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Từ ngày</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Đến ngày</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <p className="text-xs text-slate-500">
            Lọc theo tên sản phẩm, khoảng ngày hoặc loại giao dịch
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Lọc</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Bảng nhật ký */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải nhật ký kho...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <History className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-bold">Chưa có bản ghi nào</p>
            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc phát sinh giao dịch kho mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 whitespace-nowrap">
                    Ngày giờ
                  </th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3">
                    Sản phẩm
                  </th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 whitespace-nowrap">
                    Loại giao dịch
                  </th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 whitespace-nowrap">
                    Biến động
                  </th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 whitespace-nowrap">
                    Tồn kho
                  </th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 whitespace-nowrap">
                    Người thực hiện
                  </th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3">
                    Ghi chú / Mã đơn
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          {log.product?.imageUrl ? (
                            <img
                              src={log.product.imageUrl}
                              alt={log.product.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                              {log.product?.name || "Sản phẩm đã xoá"}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {log.product?.sku || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {getTypeBadge(log.changeType)}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-black ${
                            log.quantityChange > 0
                              ? "text-green-600"
                              : log.quantityChange < 0
                                ? "text-red-600"
                                : "text-slate-500"
                          }`}
                        >
                          {log.quantityChange > 0 ? "+" : ""}
                          {log.quantityChange}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500">{log.stockBefore}</span>
                        <span className="mx-1.5 text-slate-400">→</span>
                        <span className="text-sm font-bold text-slate-900">{log.stockAfter}</span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700 whitespace-nowrap">
                        {log.performedBy || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        <p className="max-w-[200px]">{log.note || "-"}</p>
                        {log.order?.orderCode && !log.note?.includes(log.order.orderCode) && (
                          <p className="text-xs font-mono text-blue-600 mt-0.5">
                            Đơn {log.order.orderCode}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Trang <span className="font-bold">{pagination.page}</span> /{" "}
              <span className="font-bold">{Math.max(1, pagination.totalPages)}</span>
              <span className="text-slate-400"> · </span>
              {pagination.total} bản ghi
            </p>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
