"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Package, Calendar } from "lucide-react";

export default function ProfitReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      if (productFilter) params.append("product", productFilter);
      const res = await fetch(`/api/admin/reports/profit?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Báo cáo</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Báo cáo lợi nhuận
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-ink-500">
            Chỉ tính các đơn hàng đã hoàn thành (COMPLETED). Tính theo giá vốn tại thời điểm đặt hàng.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">SKU/Sản phẩm</label>
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Nhập SKU hoặc tên..."
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={fetchReport} className="btn-primary w-full">
              Lọc báo cáo
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    Tổng doanh thu
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ink-950">
                    {formatCurrency(data.totals.revenue)}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink-100 text-ink-600">
                  <BarChart3 className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    Tổng vốn
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ink-950">
                    {formatCurrency(data.totals.cost)}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <Package className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    Lợi nhuận
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">
                    {formatCurrency(data.totals.profit)}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    Tỷ suất lợi nhuận
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ink-950">
                    {data.totals.marginPercent.toFixed(1)}%
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink-100 text-ink-600">
                  <Calendar className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
            <div className="border-b border-ink-200 px-5 py-4">
              <h2 className="text-sm font-bold text-ink-900">Lợi nhuận theo đơn hàng</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px]">
                <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Mã đơn</th>
                    <th className="px-4 py-3 text-left">Ngày</th>
                    <th className="px-4 py-3 text-left">Khách hàng</th>
                    <th className="px-4 py-3 text-right">Doanh thu</th>
                    <th className="px-4 py-3 text-right">Vốn</th>
                    <th className="px-4 py-3 text-right">Lợi nhuận</th>
                    <th className="px-4 py-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-ink-50/70">
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-ink-900">
                        {order.orderCode}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink-600">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink-600">{order.customerName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-ink-900">
                        {formatCurrency(order.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-ink-600">
                        {formatCurrency(order.cost)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-bold text-emerald-700">
                        {formatCurrency(order.profit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-ink-600">
                        {order.marginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
            <div className="border-b border-ink-200 px-5 py-4">
              <h2 className="text-sm font-bold text-ink-900">Lợi nhuận theo sản phẩm</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-right">SL bán</th>
                    <th className="px-4 py-3 text-right">Doanh thu</th>
                    <th className="px-4 py-3 text-right">Vốn</th>
                    <th className="px-4 py-3 text-right">Lợi nhuận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.products.map((prod: any) => (
                    <tr key={prod.sku} className="hover:bg-ink-50/70">
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-ink-900">
                        {prod.sku}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink-600">{prod.productName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-ink-900">
                        {prod.quantitySold}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-ink-900">
                        {formatCurrency(prod.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-ink-600">
                        {formatCurrency(prod.cost)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-bold text-emerald-700">
                        {formatCurrency(prod.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
