import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Warehouse, AlertTriangle } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

export default async function AdminDashboard() {
  const sessionData = await getSession();
  
  // Get statistics
  const [productCount, orderCount, pendingOrders, lowStockProducts] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING_DEPOSIT", "PREORDER_PENDING", "PAYMENT_SUBMITTED"] } } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: 5 },
      },
      take: 10,
      orderBy: { stockQuantity: "asc" },
    }),
  ]);

  const stats = [
    {
      title: "Sản phẩm",
      value: productCount,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Đơn hàng",
      value: orderCount,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Chờ xử lý",
      value: pendingOrders,
      icon: ShoppingCart,
      color: "bg-yellow-500",
    },
    {
      title: "Sắp hết hàng",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Tổng Quan</h1>
        <p className="text-slate-600 mt-1">Xin chào, {sessionData?.user.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-black text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Sản phẩm sắp hết hàng</span>
          </h2>
        </div>
        <div className="p-6">
          {lowStockProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Không có sản phẩm nào sắp hết hàng</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">SKU</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Tên sản phẩm</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Tồn kho</th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase py-3">Ngưỡng cảnh báo</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 text-sm text-slate-900 font-mono">{product.sku}</td>
                      <td className="py-3 text-sm text-slate-900">{product.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-600">{product.minStockAlert}</td>
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
