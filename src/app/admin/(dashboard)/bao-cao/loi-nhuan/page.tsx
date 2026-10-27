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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Báo cáo lợi nhuận</h1>
          <p className="text-slate-600 mt-1">Chỉ tính các đơn hàng đã hoàn thành (COMPLETED). Tính theo giá vốn tại thời điểm đặt hàng.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">SKU/Sản phẩm</label>
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Nhập SKU hoặc tên..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
            >
              Lọc báo cáo
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tổng doanh thu</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(data.totals.revenue)}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tổng vốn</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(data.totals.cost)}</p>
                </div>
                <Package className="w-10 h-10 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Lợi nhuận</p>
                  <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(data.totals.profit)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tỷ suất lợi nhuận</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{data.totals.marginPercent.toFixed(1)}%</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Lợi nhuận theo đơn hàng</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Mã đơn</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Ngày</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Khách hàng</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Doanh thu</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Vốn</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Lợi nhuận</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{order.orderCode}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-900">{formatCurrency(order.revenue)}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(order.cost)}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-600">{formatCurrency(order.profit)}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600">{order.marginPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Lợi nhuận theo sản phẩm</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">SKU</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tên sản phẩm</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">SL bán</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Doanh thu</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Vốn</th>
                    <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Lợi nhuận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.products.map((prod: any) => (
                    <tr key={prod.sku} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{prod.sku}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{prod.productName}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-900">{prod.quantitySold}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-900">{formatCurrency(prod.revenue)}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(prod.cost)}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-600">{formatCurrency(prod.profit)}</td>
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
