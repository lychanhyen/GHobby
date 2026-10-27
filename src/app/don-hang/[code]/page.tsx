import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrencyVND } from "@/lib/utils";
import { getStoreSettings } from "@/lib/settings";
import OrderPaymentSection from "@/components/OrderPaymentSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng",
  robots: {
    index: false,
    follow: false,
  },
};

async function getOrder(code: string, token?: string) {
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
    
    // Basic security check with token if provided
    if (token && order.viewToken !== token) {
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
  const order = await getOrder(code, token);

  if (!order) {
    notFound();
  }

  const settings = getStoreSettings();

  const getStatusLabel = (status: string) => {
    const labels: any = {
      PENDING_DEPOSIT: "Chờ thanh toán cọc",
      PAYMENT_SUBMITTED: "Đã chuyển khoản, chờ xác nhận",
      DEPOSITED: "Đã cọc, đang xử lý",
      SHIPPING: "Đang giao hàng",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      RETURNED: "Trả hàng",
      PREORDER_PENDING: "Pre-order - Chờ cọc",
      PREORDER_DEPOSITED: "Pre-order - Đã cọc",
      PREORDER_ARRIVED: "Pre-order - Hàng đã về",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === "COMPLETED") return "bg-green-100 text-green-700";
    if (status === "CANCELLED" || status === "RETURNED") return "bg-red-100 text-red-700";
    if (status === "DEPOSITED" || status === "SHIPPING" || status === "PREORDER_DEPOSITED" || status === "PREORDER_ARRIVED") return "bg-blue-100 text-blue-700";
    if (status === "PAYMENT_SUBMITTED") return "bg-yellow-100 text-yellow-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
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
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>

        {/* Payment Section */}
        {(order.status === "PENDING_DEPOSIT" || order.status === "PREORDER_PENDING" || order.status === "PAYMENT_SUBMITTED") && (
          <OrderPaymentSection order={order} settings={settings} />
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
          <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin giao hàng</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Họ tên:</span> {order.customerName}</p>
            <p><span className="font-bold">Số điện thoại:</span> {order.customerPhone}</p>
            <p><span className="font-bold">Địa chỉ:</span> {order.customerAddress}</p>
            <p><span className="font-bold">Tỉnh/Thành phố:</span> {order.provinceCity}</p>
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
              <span>{formatCurrencyVND(order.shippingFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-red-600 font-bold">
              <span>Tiền cọc cần thanh toán (10%)</span>
              <span>{formatCurrencyVND(order.depositRequired)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
