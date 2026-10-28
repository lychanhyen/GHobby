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
      tone: "bg-accent-50 text-accent-700",
      hint: `${completedOrders.length} đơn hoàn thành`,
    },
    {
      title: "Doanh Thu Bán Tại Nhà",
      value: formatCurrencyVND(inStoreRevenue),
      icon: Store,
      tone: "bg-ink-100 text-ink-600",
      hint: "Đơn xuất kho POS",
    },
    {
      title: "Doanh Thu Bán Online",
      value: formatCurrencyVND(onlineRevenue),
      icon: Globe,
      tone: "bg-ink-100 text-ink-600",
      hint: "Đơn đặt qua website",
    },
    {
      title: "Ước Tính Lợi Nhuận",
      value: formatCurrencyVND(estimatedProfit),
      icon: PiggyBank,
      tone: "bg-emerald-50 text-emerald-700",
      hint: "Giá bán - giá vốn",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Thống kê</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Báo Cáo &amp; Thống Kê
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Tổng hợp doanh thu bán online và bán trực tiếp tại cửa hàng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    {kpi.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ink-950">{kpi.value}</p>
                  <p className="mt-1 text-[12px] text-ink-400">{kpi.hint}</p>
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${kpi.tone}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-ink-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
            <AlertTriangle className="h-4 w-4 text-accent-600" />
            <span>Cảnh Báo Tồn Kho</span>
          </h2>
          <span className="text-[12px] text-ink-500">{lowStock.length} sản phẩm cần nhập thêm</span>
        </div>
        {lowStock.length === 0 ? (
          <p className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-ink-500">
            <Package className="h-4 w-4" />
            <span>Tất cả sản phẩm đều đủ hàng</span>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left">Tồn kho</th>
                  <th className="px-4 py-3 text-left">Ngưỡng cảnh báo</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {lowStock.map((product) => (
                  <tr key={product.id} className="hover:bg-ink-50/70">
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[13px] text-ink-600">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-900">{product.name}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${
                          product.stockQuantity === 0
                            ? "border-accent-200 bg-accent-50 text-accent-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{product.minStockAlert}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold">
                      {product.stockQuantity === 0 ? (
                        <span className="text-accent-700">Hết hàng</span>
                      ) : (
                        <span className="text-amber-700">Sắp hết</span>
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
  );
}
