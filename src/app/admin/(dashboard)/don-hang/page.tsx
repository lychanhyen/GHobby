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
    if (status === "COMPLETED") return "bg-green-100 text-green-700";
    if (status === "CANCELLED" || status === "RETURNED") return "bg-red-100 text-red-700";
    if (status === "DEPOSITED" || status === "SHIPPING" || status === "PREORDER_DEPOSITED" || status === "PREORDER_ARRIVED") return "bg-blue-100 text-blue-700";
    if (status === "PAYMENT_SUBMITTED") return "bg-yellow-100 text-yellow-700";
    return "bg-amber-100 text-amber-700";
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
      <div>
        <h1 className="text-2xl font-black text-slate-900">Quản Lý Đơn Hàng</h1>
        <p className="text-slate-600 mt-1">Quản lý và xử lý đơn hàng</p>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilters({ ...filters, status: tab.value })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.status === tab.value
                ? "bg-red-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Mã đơn</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Khách hàng</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tổng tiền</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tiền cọc</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Trạng thái</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Ngày đặt</th>
                  <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-600 font-mono">{order.orderCode}</span>
                      {order.isPreOrderOrder && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Pre-order</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{formatCurrencyVND(order.totalProductAmount)}</td>
                    <td className="px-6 py-4 text-red-600 font-bold">{formatCurrencyVND(order.depositRequired)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/don-hang/${order.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </Link>
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
