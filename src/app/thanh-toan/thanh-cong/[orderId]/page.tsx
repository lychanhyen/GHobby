import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
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
  getCustomerOrderGroup,
  getOrderStatusLabel,
  getShippingMethodLabel,
} from "@/lib/order-status";
import OrderPaymentSection from "@/components/OrderPaymentSection";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  robots: {
    index: false,
    follow: false,
  },
};

const PAYMENT_STATUSES = ["PENDING_DEPOSIT", "PREORDER_PENDING", "PAYMENT_SUBMITTED"];

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token } = await searchParams;
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/login");
  }

  if (sessionData.user.role === "ADMIN") {
    redirect("/admin");
  }

  let order: any = null;

  try {
    order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { userId: sessionData.user.id },
          ...(token ? [{ viewToken: token }] : []),
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Order success page error:", error);
  }

  if (!order) {
    notFound();
  }

  let settings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = {
      shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
      shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
      shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0905.123.456",
      bankId: process.env.NEXT_PUBLIC_SHOP_BANK_ID || "MB",
      bankAccount: process.env.NEXT_PUBLIC_SHOP_BANK_ACCOUNT || "",
      bankAccountName: process.env.NEXT_PUBLIC_SHOP_BANK_NAME || "GHOBBY SHOP",
    };
  }
  const isStorePickup = order.shippingMethod === "STORE_PICKUP";
  const statusMeta = CUSTOMER_ORDER_GROUPS[getCustomerOrderGroup(order.status)];
  const showPayment = PAYMENT_STATUSES.includes(order.status);
  const orderTotal = order.totalProductAmount + order.shippingFee;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-700" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-950">
            Đặt hàng thành công!
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Mã đơn:{" "}
            <span className="font-mono font-bold text-ink-950">#{order.orderCode}</span>
          </p>
          <span
            className={`mt-3 inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${statusMeta.badgeClass}`}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="space-y-5">
          {showPayment && <OrderPaymentSection order={order} settings={settings} token={token} />}

          <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink-950">Thông tin nhận hàng</h2>

            <div className="mt-4 flex items-start gap-3 rounded-md bg-ink-50 p-4">
              {isStorePickup ? (
                <Store className="h-5 w-5 shrink-0 text-ink-700" />
              ) : (
                <Truck className="h-5 w-5 shrink-0 text-ink-700" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink-950">
                  {getShippingMethodLabel(order.shippingMethod)}
                </p>
                {isStorePickup ? (
                  <>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                      <span>{settings.shopAddress}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
                      <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                      <span>Hotline: {settings.shopHotline}</span>
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">
                    {order.customerAddress}
                    {order.provinceCity ? `, ${order.provinceCity}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  Người nhận
                </p>
                <p className="font-bold text-ink-950">{order.customerName}</p>
                <p className="text-ink-600">{order.customerPhone}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  Ngày đặt
                </p>
                <p className="text-ink-900">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-ink-600">
                  <Clock3 className="h-4 w-4 text-ink-400" />
                  <span>{getOrderStatusLabel(order.status)}</span>
                </p>
              </div>
            </div>

            {order.note && (
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                <span className="font-bold text-ink-950">Ghi chú:</span> {order.note}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink-950">
              <Package className="h-4 w-4 text-ink-500" />
              <span>Chi tiết đơn hàng</span>
            </h2>

            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 border-b border-ink-100 pb-4 last:border-0 last:pb-0"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.productName}
                    className="h-20 w-20 shrink-0 rounded-md border border-ink-100 bg-ink-50 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug text-ink-950">{item.productName}</h3>
                    <p className="mt-1 text-xs text-ink-500">
                      Số lượng: {item.quantity} × {formatCurrencyVND(item.priceAtOrder)}
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink-950">
                      {formatCurrencyVND(item.priceAtOrder * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-ink-200 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3 text-ink-600">
                <span>Tổng tiền hàng</span>
                <span className="font-medium text-ink-900">
                  {formatCurrencyVND(order.totalProductAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-ink-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-ink-900">
                  {order.shippingFee === 0 ? "Miễn phí" : formatCurrencyVND(order.shippingFee)}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 border-t border-ink-100 pt-2.5">
                <span className="font-bold text-ink-900">Tổng giá trị đơn hàng</span>
                <span className="text-lg font-bold leading-none tracking-tight text-ink-950">
                  {formatCurrencyVND(orderTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 font-bold text-amber-700">
                <span>Tiền cọc cần thanh toán (10%)</span>
                <span>{formatCurrencyVND(order.depositRequired)}</span>
              </div>
            </div>
          </div>

          {isStorePickup && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              <p className="font-bold">Lưu ý khi nhận hàng tại cửa hàng</p>
              <p className="mt-1">
                Vui lòng chờ shop xác nhận đơn hàng trước khi đến nhận. Khi đến, bạn đọc mã đơn{" "}
                <span className="font-mono font-bold">{order.orderCode}</span> để được hỗ trợ nhanh.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link href="/profile/don-hang" className="btn-dark h-11 flex-1 gap-2 px-5">
              <Package className="h-4 w-4" />
              <span>Theo dõi đơn hàng</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-outline h-11 flex-1 gap-2 px-5">
              <ShoppingBag className="h-4 w-4" />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
