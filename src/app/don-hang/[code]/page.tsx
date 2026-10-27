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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/profile/don-hang"
          className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Đơn hàng của tôi</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Chi tiết đơn hàng</h1>
        <p className="text-slate-600">
          Mã đơn hàng: <span className="font-bold text-red-600">{order.orderCode}</span>
        </p>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Trạng thái đơn hàng</h2>
            <span className={`px-3 py-1 rounded-full border text-sm font-bold ${statusMeta.badgeClass}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>

        {/* Payment Section */}
        {(order.status === "PENDING_DEPOSIT" || order.status === "PREORDER_PENDING" || order.status === "PAYMENT_SUBMITTED") && (
          <OrderPaymentSection order={order} settings={settings} token={token} />
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sản phẩm</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex space-x-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <img
                  src={item.product.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{item.productName}</h3>
                  <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                  <p className="text-sm text-slate-900 mt-1">{formatCurrencyVND(item.priceAtOrder * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin nhận hàng</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="font-bold">Phương thức:</span>
              {isStorePickup ? (
                <Store className="w-4 h-4 text-red-600" />
              ) : (
                <Truck className="w-4 h-4 text-red-600" />
              )}
              <span>{getShippingMethodLabel(order.shippingMethod)}</span>
            </p>
            <p><span className="font-bold">Họ tên:</span> {order.customerName}</p>
            <p><span className="font-bold">Số điện thoại:</span> {order.customerPhone}</p>
            {isStorePickup ? (
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                <span><span className="font-bold">Nhận tại:</span> {settings.shopAddress}</span>
              </p>
            ) : (
              <>
                <p><span className="font-bold">Địa chỉ:</span> {order.customerAddress}</p>
                <p><span className="font-bold">Tỉnh/Thành phố:</span> {order.provinceCity}</p>
              </>
            )}
            {order.note && <p><span className="font-bold">Ghi chú:</span> {order.note}</p>}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Tóm tắt thanh toán</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng</span>
              <span>{formatCurrencyVND(order.totalProductAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span>{order.shippingFee === 0 ? "Miễn phí" : formatCurrencyVND(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Tổng giá trị đơn hàng</span>
              <span>{formatCurrencyVND(orderTotal)}</span>
            </div>
            <div className="flex justify-between text-red-600 font-bold">
              <span>Tiền cọc cần thanh toán (10%)</span>
              <span>{formatCurrencyVND(order.depositRequired)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
