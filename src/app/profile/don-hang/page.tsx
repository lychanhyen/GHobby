import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
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
    <div className="container-page py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Tài khoản</p>
            <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
              Đơn hàng của tôi
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Theo dõi trạng thái và xem lại thông tin các đơn hàng đã đặt.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-ink-500 transition-colors duration-200 hover:text-ink-950 sm:self-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Về trang cá nhân</span>
          </Link>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-ink-200 scrollbar-none">
          <Link
            href="/profile/don-hang"
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-bold transition-colors duration-200 ${
              !selectedGroup
                ? "border-ink-950 text-ink-950"
                : "border-transparent text-ink-500 hover:text-ink-900"
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
                className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-bold transition-colors duration-200 ${
                  selectedGroup === group
                    ? "border-ink-950 text-ink-950"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                {meta.label} ({counts[group]})
              </Link>
            );
          })}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-ink-200 bg-white px-6 py-14 text-center">
            <Package className="mx-auto h-9 w-9 text-ink-300" />
            <h2 className="mt-3 text-base font-bold text-ink-950">Bạn chưa có đơn hàng nào</h2>
            <p className="mt-1 text-sm text-ink-500">
              Hãy khám phá các mẫu Gunpla và Figure mới nhất của GHobby.
            </p>
            <Link href="/" className="btn-dark mt-5 px-5">
              <ShoppingBag className="h-4 w-4" />
              <span>Khám phá sản phẩm</span>
            </Link>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-lg border border-ink-200 bg-white px-6 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-ink-300" />
            <h2 className="mt-3 text-base font-bold text-ink-950">
              Không có đơn hàng ở trạng thái này
            </h2>
            <p className="mt-1 text-sm text-ink-500">Thử chọn một trạng thái khác để xem đơn hàng.</p>
            <Link
              href="/profile/don-hang"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-700 transition-colors duration-200 hover:text-accent-700"
            >
              <span>Xem tất cả đơn hàng</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => {
              const meta = CUSTOMER_ORDER_GROUPS[getCustomerOrderGroup(order.status)];
              const isStorePickup = order.shippingMethod === "STORE_PICKUP";
              const orderTotal = order.totalProductAmount + order.shippingFee;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-lg border border-ink-200 bg-white transition-colors duration-200 hover:border-ink-300"
                >
                  <div className="flex flex-col gap-3 border-b border-ink-100 bg-ink-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-ink-950">
                        #{order.orderCode}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                        <CalendarDays className="h-3.5 w-3.5 text-ink-400" />
                        <span>Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center self-start rounded-sm border px-2 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.product.imageUrl}
                            alt={item.productName}
                            className="h-14 w-14 shrink-0 rounded-md border border-ink-100 bg-ink-50 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-ink-950">
                              {item.productName}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-500">
                              SL: {item.quantity} × {formatCurrencyVND(item.priceAtOrder)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-ink-900">
                            {formatCurrencyVND(item.priceAtOrder * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 border-t border-ink-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 text-sm">
                        <p className="flex items-center gap-1.5 font-bold text-ink-950">
                          {isStorePickup ? (
                            <Store className="h-4 w-4 text-ink-500" />
                          ) : (
                            <Truck className="h-4 w-4 text-ink-500" />
                          )}
                          <span>{getShippingMethodLabel(order.shippingMethod)}</span>
                        </p>
                        <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                          <span>
                            {isStorePickup
                              ? settings.shopAddress
                              : `${order.customerAddress}${order.provinceCity ? `, ${order.provinceCity}` : ""}`}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="text-xs text-ink-500">Tổng giá trị đơn hàng</p>
                        <p className="mt-0.5 text-lg font-bold tracking-tight text-ink-950">
                          {formatCurrencyVND(orderTotal)}
                        </p>
                        <Link
                          href={`/don-hang/${order.orderCode}?token=${order.viewToken}`}
                          className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-accent-700 transition-colors duration-200 hover:text-accent-800"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight className="h-4 w-4" />
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
    </div>
  );
}
