import { prisma } from "@/lib/prisma";
import { formatCurrencyVND } from "@/lib/utils";
import {
  TrendingUp,
  Store,
  Globe,
  PiggyBank,
  AlertTriangle,
  Package,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const [completedOrders, orderItems, lowStockProducts] = await Promise.all([
    prisma.order.findMany({
      where: { status: "COMPLETED" },
      select: {
        id: true,
        channel: true,
        totalProductAmount: true,
      },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: "COMPLETED" } },
      select: {
        priceAtOrder: true,
        costPriceAtOrder: true,
        quantity: true,
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        name: true,
        stockQuantity: true,
        minStockAlert: true,
      },
      orderBy: { stockQuantity: "asc" },
    }),
  ]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalProductAmount, 0);
  const inStoreRevenue = completedOrders
    .filter((o) => o.channel === "IN_STORE")
    .reduce((sum, o) => sum + o.totalProductAmount, 0);
  const onlineRevenue = completedOrders
    .filter((o) => o.channel !== "IN_STORE")
    .reduce((sum, o) => sum + o.totalProductAmount, 0);

  const estimatedProfit = orderItems.reduce(
    (sum, item) => sum + (item.priceAtOrder - item.costPriceAtOrder) * item.quantity,
    0
  );

  const lowStock = lowStockProducts.filter(
    (p) => p.stockQuantity <= p.minStockAlert
  );

  const kpis = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrencyVND(totalRevenue),
      icon: TrendingUp,
      color: "bg-red-500",
      hint: `${completedOrders.length} đơn hoàn thành`,
    },
    {
      title: "Doanh Thu Bán Tại Nhà",
      value: formatCurrencyVND(inStoreRevenue),
      icon: Store,
      color: "bg-amber-500",
      hint: "Đơn xuất kho POS",
    },
    {
      title: "Doanh Thu Bán Online",
      value: formatCurrencyVND(onlineRevenue),
      icon: Globe,
      color: "bg-blue-500",
      hint: "Đơn đặt qua website",
    },
    {
      title: "Ước Tính Lợi Nhuận",
      value: formatCurrencyVND(estimatedProfit),
      icon: PiggyBank,
      color: "bg-green-600",
      hint: "Giá bán - giá vốn",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Báo Cáo & Thống Kê</h1>
        <p className="text-slate-600 mt-1">
          Tổng hợp doanh thu bán online và bán trực tiếp tại cửa hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">{kpi.title}</p>
                  <p className="text-2xl font-black text-slate-900 mt-2">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.hint}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Cảnh Báo Tồn Kho</span>
          </h2>
          <span className="text-sm text-slate-600">{lowStock.length} sản phẩm cần nhập thêm</span>
        </div>
        <div className="p-6">
          {lowStock.length === 0 ? (
            <p className="text-slate-500 text-center py-8 flex items-center justify-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Tất cả sản phẩm đều đủ hàng</span>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">SKU</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Tên sản phẩm</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Tồn kho</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Ngưỡng cảnh báo</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 text-sm text-slate-900 font-mono">{product.sku}</td>
                      <td className="py-3 text-sm text-slate-900">{product.name}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            product.stockQuantity === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-600">{product.minStockAlert}</td>
                      <td className="py-3 text-sm font-bold">
                        {product.stockQuantity === 0 ? (
                          <span className="text-red-600">Hết hàng</span>
                        ) : (
                          <span className="text-amber-600">Sắp hết</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
