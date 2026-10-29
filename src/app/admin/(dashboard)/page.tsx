import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Package,
  Plus,
  Settings,
  ShoppingCart,
} from "lucide-react";

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

  // Chart data: orders by date (last 7 days)
  let chartData: { date: string; count: number }[] = [];
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const ordersRecent = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const map = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().split("T")[0];
      map.set(key, 0);
    }
    for (const o of ordersRecent) {
      const key = o.createdAt.toISOString().split("T")[0];
      map.set(key, (map.get(key) || 0) + 1);
    }
    chartData = Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  } catch (e) {
    console.error("Chart data error:", e);
  }

  const stats = [
    {
      title: "Sản phẩm",
      value: productCount,
      icon: Package,
      href: "/admin/san-pham",
      hint: "Đang kinh doanh",
      tone: "bg-ink-100 text-ink-600",
    },
    {
      title: "Đơn hàng",
      value: orderCount,
      icon: ShoppingCart,
      href: "/admin/don-hang",
      hint: "Tất cả đơn đã ghi nhận",
      tone: "bg-ink-100 text-ink-600",
    },
    {
      title: "Chờ xử lý",
      value: pendingOrders,
      icon: ClipboardList,
      href: "/admin/don-hang",
      hint: "Cần xác nhận hoặc xử lý",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Sắp hết hàng",
      value: lowStockCount,
      icon: AlertTriangle,
      href: "/admin/kho",
      hint: "Tồn kho từ 5 sản phẩm trở xuống",
      tone: "bg-accent-50 text-accent-700",
    },
  ];

  const quickActions = [
    { label: "Thêm sản phẩm", description: "Tạo sản phẩm mới", href: "/admin/san-pham/tao-moi", icon: Plus },
    { label: "Xử lý đơn hàng", description: "Theo dõi đơn đang chờ", href: "/admin/don-hang", icon: ShoppingCart },
    { label: "Cấu hình cửa hàng", description: "Thông tin và vận chuyển", href: "/admin/cau-hinh", icon: Settings },
    { label: "Xem thống kê", description: "Báo cáo doanh thu và đơn hàng", href: "/admin/thong-ke", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Tổng quan</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Tổng Quan
          </h1>
          <p className="mt-1 text-sm text-ink-500">Xin chào, {sessionData?.user.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/san-pham/tao-moi" className="btn-primary">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group card p-5 transition-colors hover:border-ink-400"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ink-950">{stat.value}</p>
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${stat.tone}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink-400 transition-colors group-hover:text-ink-700">
                {stat.hint}
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Link>
          );
        })}
      </div>

      {/* Sales chart */}
      <section className="card">
        <div className="border-b border-ink-200 px-5 py-4">
          <h2 className="text-sm font-bold text-ink-900">Doanh số trong 7 ngày gần nhất</h2>
        </div>
        <div className="px-5 pb-4">
          {chartData && chartData.length > 0 ? (
            <>
              <div className="flex h-[300px] items-stretch justify-between gap-3">
                {chartData.map((d) => {
                  const max = Math.max(...chartData.map((c) => c.count), 1);
                  // Dùng chiều cao px cố định để cột luôn hiển thị,
                  // tránh trường hợp height % bị tính theo parent rỗng.
                  const heightPx = d.count > 0 ? Math.max((d.count / max) * 220, 6) : 0;
                  return (
                    <div key={d.date} className="flex h-full flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-bold tracking-wide text-ink-500">
                        {d.count}
                      </span>
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-md bg-accent-600 transition-colors"
                          style={{ height: `${heightPx}px` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-ink-700">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-ink-500">Nguồn dữ liệu: đơn hàng thực tế từ hệ thống</p>
            </>
          ) : (
            <p className="text-sm text-ink-500">Chưa có dữ liệu đơn hàng</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-ink-100 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 bg-white p-4 transition-colors hover:bg-ink-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition-colors group-hover:border-ink-300 group-hover:text-ink-900">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink-900">{action.label}</span>
                    <span className="block truncate text-[12px] text-ink-500">{action.description}</span>
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-ink-600" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card lg:col-span-2">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Cần chú ý</h2>
          </div>
          <div className="divide-y divide-ink-100">
            <Link
              href="/admin/don-hang"
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-ink-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <ClipboardList className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink-900">{pendingOrders} đơn chờ xử lý</span>
                <span className="block text-[12px] text-ink-500">Xác nhận cọc và cập nhật trạng thái</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
            </Link>
            <Link
              href="/admin/kho"
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-ink-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-700">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink-900">{lowStockCount} sản phẩm sắp hết</span>
                <span className="block text-[12px] text-ink-500">Kiểm tra tồn kho và nhập thêm hàng</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
            </Link>
            <div className="px-5 py-4">
              <p className="text-[12px] leading-relaxed text-ink-500">
                Số liệu được cập nhật trực tiếp từ hệ thống bán hàng. Dùng menu bên trái để
                chuyển nhanh giữa các khu vực quản trị.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
