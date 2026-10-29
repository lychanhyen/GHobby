import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Store, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatCurrencyVND } from "@/lib/utils";
import { getStoreSettings } from "@/lib/settings";
import {
  getCustomerOrderGroupMeta,
  getOrderStatusLabel,
  getShippingMethodLabel,
} from "@/lib/order-status";
import OrderPaymentSection from "@/components/OrderPaymentSection";
import CancelOrderButton from "@/components/CancelOrderButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng",
  robots: {
    index: false,
    follow: false,
  },
};

async function getOrder(code: string, token?: string, userId?: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return null;

    const isOwner = Boolean(userId && order.userId === userId);
    const hasValidToken = Boolean(token && order.viewToken === token);

    if (!isOwner && !hasValidToken) {
      return null;
    }

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { code } = await params;
  const { token } = await searchParams;
  const sessionData = await getSession();

  if (sessionData?.user.role === "ADMIN") {
    redirect("/admin");
  }

  const order = await getOrder(code, token, sessionData?.user.id);

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
    };
  }
  const statusMeta = getCustomerOrderGroupMeta(order.status);
  const isStorePickup = order.shippingMethod === "STORE_PICKUP";
  const orderTotal = order.totalProductAmount + order.shippingFee;

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/profile/don-hang"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 transition-colors duration-200 hover:text-ink-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Đơn hàng của tôi</span>
          </Link>
          <p className="eyebrow mt-4">Đơn hàng</p>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Chi tiết đơn hàng
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Mã đơn hàng:{" "}
            <span className="font-mono font-bold text-ink-950">{order.orderCode}</span>
          </p>
        </div>

        <div className="space-y-5">
          {/* Status */}
          <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-ink-950">Trạng thái đơn hàng</h2>
              <span
                className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${statusMeta.badgeClass}`}
              >
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Payment Section */}
          {(order.status === "PENDING_DEPOSIT" || order.status === "PREORDER_PENDING" || order.status === "PAYMENT_SUBMITTED") && (
            <OrderPaymentSection order={order} settings={settings} token={token} />
          )}

          {/* Order Items */}
          <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink-950">Sản phẩm</h2>
            <div className="mt-4 space-y-4">
              {order.items.map((item: any) => (
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
                    <p className="mt-1 text-xs text-ink-500">Số lượng: {item.quantity}</p>
                    <p className="mt-1 text-sm font-bold text-ink-900">
                      {formatCurrencyVND(item.priceAtOrder * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink-950">Thông tin nhận hàng</h2>
            <dl className="mt-4 divide-y divide-ink-100 rounded-md border border-ink-200 text-sm">
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 text-ink-500">Phương thức</dt>
                <dd className="flex items-center gap-1.5 text-right font-medium text-ink-900">
                  {isStorePickup ? (
                    <Store className="h-4 w-4 shrink-0 text-ink-500" />
                  ) : (
                    <Truck className="h-4 w-4 shrink-0 text-ink-500" />
                  )}
                  <span>{getShippingMethodLabel(order.shippingMethod)}</span>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 text-ink-500">Họ tên</dt>
                <dd className="text-right font-medium text-ink-900">{order.customerName}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 text-ink-500">Số điện thoại</dt>
                <dd className="text-right font-medium text-ink-900">{order.customerPhone}</dd>
              </div>
              {isStorePickup ? (
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="shrink-0 text-ink-500">Nhận tại</dt>
                  <dd className="flex items-start justify-end gap-1.5 text-right font-medium text-ink-900">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <span>{settings.shopAddress}</span>
                  </dd>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="shrink-0 text-ink-500">Địa chỉ</dt>
                    <dd className="text-right font-medium text-ink-900">{order.customerAddress}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="shrink-0 text-ink-500">Tỉnh/Thành phố</dt>
                    <dd className="text-right font-medium text-ink-900">{order.provinceCity}</dd>
                  </div>
                </>
              )}
              {order.note && (
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="shrink-0 text-ink-500">Ghi chú</dt>
                  <dd className="text-right font-medium text-ink-900">{order.note}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Cancel action */}
          {order.status !== "CANCELLED" && order.status !== "RETURNED" && order.status !== "COMPLETED" && (
            <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-bold text-ink-950">Huỷ đơn hàng</h2>
              <p className="mt-2 text-sm text-ink-500">Bạn có thể huỷ đơn nhưng tiền cọc sẽ không được hoàn lại.</p>
              <CancelOrderButton orderCode={order.orderCode} token={token || undefined} />
            </div>
          )}

          {/* Order Summary */}
          <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink-950">Tóm tắt thanh toán</h2>
            <div className="mt-4 space-y-2 text-sm">
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
              <div className="flex items-end justify-between gap-3 border-t border-ink-200 pt-2.5">
                <span className="font-bold text-ink-900">Tổng giá trị đơn hàng</span>
                <span className="text-lg font-bold tracking-tight text-ink-950">
                  {formatCurrencyVND(orderTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 font-bold text-amber-700">
                <span>Tiền cọc cần thanh toán (10%)</span>
                <span>{formatCurrencyVND(order.depositRequired)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
