"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Truck, RotateCcw } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

export default function OrderDetailAdminPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        alert(data.message);
        router.push("/admin/don-hang");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, reason?: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Cập nhật đơn hàng thành công");
        fetchOrder();
        setShowCancelModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setProcessing(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Cập nhật trạng thái thành công");
        fetchOrder();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!order) return null;

  const getStatusLabel = (status: string) => {
    const labels: any = {
      PENDING_DEPOSIT: "Chờ cọc",
      PAYMENT_SUBMITTED: "Đã chuyển khoản",
      DEPOSITED: "Đã cọc",
      SHIPPING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      RETURNED: "Trả hàng",
      PREORDER_PENDING: "Pre-order chờ cọc",
      PREORDER_DEPOSITED: "Pre-order đã cọc",
      PREORDER_ARRIVED: "Pre-order đã về",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/don-hang" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Chi tiết đơn hàng {order.orderCode}</h1>
            <p className="text-slate-600 mt-1">Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          </div>
        </div>
        <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Thao tác xử lý</h2>
        <div className="flex flex-wrap gap-3">
          {(order.status === "PENDING_DEPOSIT" || order.status === "PREORDER_PENDING" || order.status === "PAYMENT_SUBMITTED") && (
            <button
              onClick={() => handleAction("confirm_deposit")}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận đã nhận cọc</span>
            </button>
          )}
          {(order.status === "DEPOSITED" || order.status === "PREORDER_DEPOSITED") && (
            <button
              onClick={() => updateStatus("SHIPPING")}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              <span>Chuyển sang đang giao</span>
            </button>
          )}
          {order.status === "SHIPPING" && (
            <button
              onClick={() => updateStatus("COMPLETED")}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Hoàn thành đơn hàng</span>
            </button>
          )}
          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Hủy đơn hàng</span>
            </button>
          )}
          {order.status === "CANCELLED" && (
            <button
              onClick={() => handleAction("restore")}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-500 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục đơn</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin khách hàng</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Họ tên:</span> {order.customerName}</p>
            <p><span className="font-bold">Số điện thoại:</span> {order.customerPhone}</p>
            <p>
              <span className="font-bold">Phương thức nhận hàng:</span>{" "}
              {order.shippingMethod === "STORE_PICKUP" ? "Nhận tại cửa hàng" : "Giao hàng tận nơi"}
            </p>
            <p>
              <span className="font-bold">
                {order.shippingMethod === "STORE_PICKUP" ? "Nhận tại:" : "Địa chỉ:"}
              </span>{" "}
              {order.shippingMethod === "STORE_PICKUP"
                ? "Khách tự đến cửa hàng nhận hàng"
                : order.customerAddress}
            </p>
            {order.shippingMethod !== "STORE_PICKUP" && (
              <p><span className="font-bold">Tỉnh/Thành phố:</span> {order.provinceCity}</p>
            )}
            {order.note && <p><span className="font-bold">Ghi chú:</span> {order.note}</p>}
            {order.confirmedDepositBy && (
              <p><span className="font-bold">Xác nhận cọc bởi:</span> {order.confirmedDepositBy.fullName}</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Tóm tắt đơn hàng</h2>
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
              <span>Tiền cọc</span>
              <span>{formatCurrencyVND(order.depositRequired)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Sản phẩm đã đặt</h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex space-x-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
              <img
                src={item.product.imageUrl}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{item.productName}</h3>
                <p className="text-sm text-slate-500">SKU: {item.product.sku}</p>
                <p className="text-sm text-slate-900 mt-1">SL: {item.quantity} x {formatCurrencyVND(item.priceAtOrder)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrencyVND(item.priceAtOrder * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Lịch sử trạng thái</h2>
        <div className="space-y-3">
          {order.statusHistories.map((history: any) => (
            <div key={history.id} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">
                  {getStatusLabel(history.fromStatus)} → {getStatusLabel(history.toStatus)}
                </p>
                <p className="text-xs text-slate-500">
                  {history.actorName} • {new Date(history.createdAt).toLocaleString("vi-VN")}
                </p>
                {history.note && <p className="text-xs text-slate-600 mt-1">{history.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Hủy đơn hàng</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lý do hủy đơn *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleAction("cancel", cancelReason)}
                  disabled={!cancelReason || processing}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
                >
                  {processing ? "Đang xử lý..." : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
