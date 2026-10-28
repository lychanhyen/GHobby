"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      PENDING_DEPOSIT: "Chờ cọc",
      PAYMENT_SUBMITTED: "Đã chuyển khoản",
      DEPOSITED: "Đã cọc",
      SHIPPING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      RETURNED: "Trả hàng",
      PREORDER_PENDING: "Pre-order chờ cọc",
      PREORDER_DEPOSITED: "Pre-order đã cọc",
      PREORDER_ARRIVED: "Pre-order đã về",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === "COMPLETED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "CANCELLED" || status === "RETURNED") return "border-accent-200 bg-accent-50 text-accent-700";
    if (status === "DEPOSITED" || status === "SHIPPING" || status === "PREORDER_DEPOSITED" || status === "PREORDER_ARRIVED") return "border-ink-200 bg-ink-50 text-ink-700";
    if (status === "PAYMENT_SUBMITTED") return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const statusTabs = [
    { value: "", label: "Tất cả" },
    { value: "PENDING_DEPOSIT", label: "Chờ cọc" },
    { value: "PAYMENT_SUBMITTED", label: "Đã chuyển khoản" },
    { value: "DEPOSITED", label: "Đã cọc" },
    { value: "PREORDER_PENDING", label: "Pre-order chờ cọc" },
    { value: "PREORDER_DEPOSITED", label: "Pre-order đã cọc" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Đơn hàng</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Quản Lý Đơn Hàng
          </h1>
          <p className="mt-1 text-sm text-ink-500">Quản lý và xử lý đơn hàng</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-ink-200 bg-white p-1.5">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilters({ ...filters, status: tab.value })}
            className={`rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ${
              filters.status === tab.value
                ? "bg-ink-950 text-white"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-bold text-ink-900">Chưa có đơn hàng nào</p>
            <p className="mt-1 text-sm text-ink-500">Đơn hàng mới sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Tiền cọc</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày đặt</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ink-50/70">
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="font-mono text-sm font-bold text-accent-700">{order.orderCode}</span>
                      {order.isPreOrderOrder && (
                        <span className="ml-2 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          Pre-order
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-ink-900">{order.customerName}</p>
                      <p className="text-[12px] text-ink-500">{order.customerPhone}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-ink-900">
                      {formatCurrencyVND(order.totalProductAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-accent-700">
                      {formatCurrencyVND(order.depositRequired)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/don-hang/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 px-2.5 py-1.5 text-[12px] font-bold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem chi tiết</span>
                        </Link>
                      </div>
                    </td>
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
