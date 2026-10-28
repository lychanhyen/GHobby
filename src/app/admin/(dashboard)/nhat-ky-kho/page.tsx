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

const BADGE_CLASS =
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold";

function getTypeBadge(type: string) {
  switch (type) {
    case "POS_SALE":
    case "EXPORT_MANUAL":
      return (
        <span className={`${BADGE_CLASS} border-amber-200 bg-amber-50 text-amber-700`}>
          Bán tại quán
        </span>
      );
    case "ONLINE_SALE":
    case "ORDER_DEDUCT":
      return (
        <span className={`${BADGE_CLASS} border-ink-200 bg-ink-50 text-ink-700`}>
          Đơn online
        </span>
      );
    case "RESTOCK":
    case "IMPORT":
      return (
        <span className={`${BADGE_CLASS} border-emerald-200 bg-emerald-50 text-emerald-700`}>
          Nhập kho
        </span>
      );
    case "ORDER_CANCEL_RESTOCK":
      return (
        <span className={`${BADGE_CLASS} border-emerald-200 bg-emerald-50 text-emerald-700`}>
          Hoàn kho
        </span>
      );
    case "MANUAL_ADJUST":
    case "ADJUST":
      return (
        <span className={`${BADGE_CLASS} border-yellow-200 bg-yellow-50 text-yellow-700`}>
          Chỉnh thủ công
        </span>
      );
    case "DAMAGED":
      return (
        <span className={`${BADGE_CLASS} border-accent-200 bg-accent-50 text-accent-700`}>
          Hàng hỏng
        </span>
      );
    case "WARRANTY":
      return (
        <span className={`${BADGE_CLASS} border-ink-200 bg-ink-50 text-ink-700`}>
          Bảo hành
        </span>
      );
    default:
      return (
        <span className={`${BADGE_CLASS} border-ink-200 bg-ink-50 text-ink-600`}>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            <History className="h-5 w-5 text-ink-400" strokeWidth={1.8} />
            <span>Nhật Ký Biến Động Kho</span>
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Minh bạch lịch sử xuất/nhập kho và mọi thay đổi tồn kho
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-2 text-[12px] font-bold text-ink-600">
          <Package className="h-4 w-4" />
          <span>{loading ? "Đang tải..." : `${pagination.total} bản ghi`}</span>
        </div>
      </div>

      {/* Bộ lọc */}
      <form onSubmit={handleApplyFilters} className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tìm sản phẩm</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Loại giao dịch</label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value)}
              className="input"
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
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Từ ngày</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input pl-10 pr-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Đến ngày</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="input pl-10 pr-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
          <p className="text-[12px] text-ink-500">
            Lọc theo tên sản phẩm, khoảng ngày hoặc loại giao dịch
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-outline"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Đặt lại</span>
            </button>
            <button type="submit" className="btn-primary">
              <Search className="h-4 w-4" />
              <span>Lọc</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
          {error}
        </div>
      )}

      {/* Bảng nhật ký */}
      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải nhật ký kho...</div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <History className="mx-auto mb-3 h-9 w-9 text-ink-300" strokeWidth={1.5} />
            <p className="font-bold text-ink-900">Chưa có bản ghi nào</p>
            <p className="mt-1 text-sm text-ink-500">
              Thử thay đổi bộ lọc hoặc phát sinh giao dịch kho mới
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left">Ngày giờ</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left">Loại giao dịch</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left">Biến động</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left">Tồn kho</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left">Người thực hiện</th>
                  <th className="px-4 py-3 text-left">Ghi chú / Mã đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {logs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-ink-50/70">
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink-600">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {log.product?.imageUrl ? (
                            <img
                              src={log.product.imageUrl}
                              alt={log.product.name}
                              className="h-9 w-9 shrink-0 rounded-md border border-ink-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-100">
                              <Package className="h-4 w-4 text-ink-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-sm font-bold text-ink-900">
                              {log.product?.name || "Sản phẩm đã xoá"}
                            </p>
                            <p className="font-mono text-[11px] text-ink-500">
                              {log.product?.sku || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">{getTypeBadge(log.changeType)}</td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`text-sm font-bold ${
                            log.quantityChange > 0
                              ? "text-emerald-700"
                              : log.quantityChange < 0
                                ? "text-accent-700"
                                : "text-ink-500"
                          }`}
                        >
                          {log.quantityChange > 0 ? "+" : ""}
                          {log.quantityChange}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-sm text-ink-400">{log.stockBefore}</span>
                        <span className="mx-1.5 text-ink-300">→</span>
                        <span className="text-sm font-bold text-ink-900">{log.stockAfter}</span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink-700">
                        {log.performedBy || "-"}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-ink-600">
                        <p className="max-w-[220px]">{log.note || "-"}</p>
                        {log.order?.orderCode && !log.note?.includes(log.order.orderCode) && (
                          <p className="mt-0.5 font-mono text-[11px] font-bold text-accent-700">
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
          <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-5 py-3.5 sm:flex-row">
            <p className="text-sm text-ink-600">
              Trang <span className="font-bold">{pagination.page}</span> /{" "}
              <span className="font-bold">{Math.max(1, pagination.totalPages)}</span>
              <span className="text-ink-400"> · </span>
              {pagination.total} bản ghi
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1}
                className="btn-outline px-3 py-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Trước</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-outline px-3 py-2"
              >
                <span>Sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
