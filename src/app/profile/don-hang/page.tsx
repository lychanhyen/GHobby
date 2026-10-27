import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { formatCurrencyVND } from "@/lib/utils";
import {
  CUSTOMER_ORDER_GROUPS,
  CUSTOMER_ORDER_GROUP_KEYS,
  CustomerOrderGroup,
  getCustomerOrderGroup,
  getShippingMethodLabel,
  isCustomerOrderGroup,
} from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ "trang-thai"?: string }>;
}) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/login");
  }

  if (sessionData.user.role === "ADMIN") {
    redirect("/admin");
  }

  const { "trang-thai": statusParam } = await searchParams;
  const selectedGroup = isCustomerOrderGroup(statusParam) ? statusParam : null;
  let settings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = {
      shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
      shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
    };
  }

  let orders: any[] = [];

  try {
    orders = await prisma.order.findMany({
      where: { userId: sessionData.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Customer orders error:", error);
  }

  const counts = CUSTOMER_ORDER_GROUP_KEYS.reduce(
    (acc, group) => {
      acc[group] = orders.filter(
        (order) => getCustomerOrderGroup(order.status) === group
      ).length;
      return acc;
    },
    {} as Record<CustomerOrderGroup, number>
  );

  const visibleOrders = selectedGroup
    ? orders.filter((order) => getCustomerOrderGroup(order.status) === selectedGroup)
    : orders;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Đơn hàng của tôi</h1>
          <p className="text-slate-600 mt-2">
            Theo dõi trạng thái và xem lại thông tin các đơn hàng đã đặt.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
        >
          <span>←</span>
          <span>Về trang cá nhân</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-wrap gap-2 mb-6">
        <Link
          href="/profile/don-hang"
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            !selectedGroup
              ? "bg-red-600 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Tất cả ({orders.length})
        </Link>
        {CUSTOMER_ORDER_GROUP_KEYS.map((group) => {
          const meta = CUSTOMER_ORDER_GROUPS[group];
          return (
            <Link
              key={group}
              href={`/profile/don-hang?trang-thai=${group}`}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                selectedGroup === group
                  ? "bg-red-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="mr-1">{meta.emoji}</span>
              {meta.label} ({counts[group]})
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <Package className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa có đơn hàng nào</h2>
          <p className="text-slate-600 mb-6">
            Hãy khám phá các mẫu Gunpla và Figure mới nhất của GHobby.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Khám phá sản phẩm</span>
          </Link>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Không có đơn hàng ở trạng thái này
          </h2>
          <p className="text-slate-600 mb-5">Thử chọn một trạng thái khác để xem đơn hàng.</p>
          <Link
            href="/profile/don-hang"
            className="inline-flex items-center space-x-2 text-sm font-bold text-red-600 hover:text-red-500"
          >
            <span>Xem tất cả đơn hàng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {visibleOrders.map((order) => {
            const meta = CUSTOMER_ORDER_GROUPS[getCustomerOrderGroup(order.status)];
            const isStorePickup = order.shippingMethod === "STORE_PICKUP";
            const orderTotal = order.totalProductAmount + order.shippingFee;

            return (
              <article
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-slate-100 bg-slate-50/70">
                  <div>
                    <p className="font-mono font-black text-red-600 text-lg">
                      #{order.orderCode}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full border text-sm font-bold ${meta.badgeClass}`}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.productName}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-sm text-slate-500">
                            SL: {item.quantity} × {formatCurrencyVND(item.priceAtOrder)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrencyVND(item.priceAtOrder * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 font-bold text-slate-900">
                        {isStorePickup ? (
                          <Store className="w-4 h-4 text-red-600" />
                        ) : (
                          <Truck className="w-4 h-4 text-red-600" />
                        )}
                        <span>{getShippingMethodLabel(order.shippingMethod)}</span>
                      </p>
                      <p className="flex items-start gap-1.5 text-slate-600 mt-1">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {isStorePickup
                            ? settings.shopAddress
                            : `${order.customerAddress}${order.provinceCity ? `, ${order.provinceCity}` : ""}`}
                        </span>
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-slate-500">Tổng giá trị đơn hàng</p>
                      <p className="text-lg font-black text-slate-900">
                        {formatCurrencyVND(orderTotal)}
                      </p>
                      <Link
                        href={`/don-hang/${order.orderCode}?token=${order.viewToken}`}
                        className="inline-flex items-center space-x-1 text-sm font-bold text-red-600 hover:text-red-500 mt-1"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
