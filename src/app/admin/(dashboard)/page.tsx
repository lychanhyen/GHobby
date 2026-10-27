import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Package, ShoppingCart, AlertTriangle } from "lucide-react";

export default async function AdminDashboard() {
  const sessionData = await getSession();

  let productCount = 0;
  let orderCount = 0;
  let pendingOrders = 0;
  let lowStockCount = 0;

  // Dashboard không được làm sập trang nếu DB tạm thời gián đoạn.
  try {
    [productCount, orderCount, pendingOrders, lowStockCount] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: ["PENDING_DEPOSIT", "PREORDER_PENDING", "PAYMENT_SUBMITTED"] },
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          stockQuantity: { lte: 5 },
        },
      }),
    ]);
  } catch (error) {
    console.error("Dashboard stats error:", error);
  }

  const stats = [
    {
      title: "Sản phẩm",
      value: productCount,
      icon: Package,
      color: "bg-blue-500",
      href: "/admin/san-pham",
    },
    {
      title: "Đơn hàng",
      value: orderCount,
      icon: ShoppingCart,
      color: "bg-green-500",
      href: "/admin/don-hang",
    },
    {
      title: "Chờ xử lý",
      value: pendingOrders,
      icon: ShoppingCart,
      color: "bg-yellow-500",
      href: "/admin/don-hang",
    },
    {
      title: "Sắp hết hàng",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "bg-red-500",
      href: "/admin/kho",
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
            <Link
              key={stat.title}
              href={stat.href}
              className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-black text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="flex items-center space-x-1 text-xs font-bold text-slate-400 group-hover:text-red-600 transition-colors mt-4">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
