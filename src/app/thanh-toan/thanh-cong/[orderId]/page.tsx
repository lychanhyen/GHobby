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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Đặt hàng thành công!</h1>
        <p className="text-slate-600 mt-2">
          Mã đơn: <span className="font-mono font-black text-red-600">#{order.orderCode}</span>
        </p>
        <span
          className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full border text-sm font-bold ${statusMeta.badgeClass}`}
        >
          <span>{statusMeta.emoji}</span>
          <span>{statusMeta.label}</span>
        </span>
      </div>

      <div className="space-y-6">
        {showPayment && <OrderPaymentSection order={order} settings={settings} token={token} />}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin nhận hàng</h2>

          <div className="flex items-start space-x-3 rounded-lg bg-slate-50 p-4 mb-4">
            {isStorePickup ? (
              <Store className="w-6 h-6 text-red-600 flex-shrink-0" />
            ) : (
              <Truck className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-slate-900">
                {getShippingMethodLabel(order.shippingMethod)}
              </p>
              {isStorePickup ? (
                <>
                  <p className="text-sm text-slate-600 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{settings.shopAddress}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>Hotline: {settings.shopHotline}</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600 mt-1">
                  {order.customerAddress}
                  {order.provinceCity ? `, ${order.provinceCity}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Người nhận</p>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Ngày đặt</p>
              <p className="text-slate-900">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                <Clock3 className="w-4 h-4" />
                <span>{getOrderStatusLabel(order.status)}</span>
              </p>
            </div>
          </div>

          {order.note && (
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-bold text-slate-900">Ghi chú:</span> {order.note}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-red-600" />
            <span>Chi tiết đơn hàng</span>
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex space-x-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{item.productName}</h3>
                  <p className="text-sm text-slate-500">
                    Số lượng: {item.quantity} × {formatCurrencyVND(item.priceAtOrder)}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {formatCurrencyVND(item.priceAtOrder * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng</span>
              <span>{formatCurrencyVND(order.totalProductAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span>
                {order.shippingFee === 0 ? "Miễn phí" : formatCurrencyVND(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Tổng giá trị đơn hàng</span>
              <span>{formatCurrencyVND(orderTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-600">
              <span>Tiền cọc cần thanh toán (10%)</span>
              <span>{formatCurrencyVND(order.depositRequired)}</span>
            </div>
          </div>
        </div>

        {isStorePickup && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-bold">Lưu ý khi nhận hàng tại cửa hàng</p>
            <p className="mt-1">
              Vui lòng chờ shop xác nhận đơn hàng trước khi đến nhận. Khi đến, bạn đọc mã đơn{" "}
              <span className="font-mono font-bold">{order.orderCode}</span> để được hỗ trợ nhanh.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/profile/don-hang"
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>Theo dõi đơn hàng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
