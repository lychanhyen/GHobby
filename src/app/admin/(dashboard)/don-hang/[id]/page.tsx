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
    return <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>;
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

  const getStatusBadgeClass = (status: string) => {
    if (status === "COMPLETED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "CANCELLED" || status === "RETURNED") return "border-accent-200 bg-accent-50 text-accent-700";
    if (status === "PAYMENT_SUBMITTED" || status === "PENDING_DEPOSIT" || status === "PREORDER_PENDING") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }
    return "border-ink-200 bg-ink-50 text-ink-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/don-hang"
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition-colors hover:border-ink-300 hover:bg-white hover:text-ink-900"
            aria-label="Quay lại danh sách đơn hàng"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="eyebrow">Chi tiết đơn hàng</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
              {order.orderCode}
              <span
                className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${getStatusBadgeClass(order.status)}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="border-b border-ink-200 px-5 py-4">
          <h2 className="text-sm font-bold text-ink-900">Thao tác xử lý</h2>
        </div>
        <div className="flex flex-wrap gap-2 p-5">
          {(order.status === "PENDING_DEPOSIT" || order.status === "PREORDER_PENDING" || order.status === "PAYMENT_SUBMITTED") && (
            <button
              onClick={() => handleAction("confirm_deposit")}
              disabled={processing}
              className="btn-dark"
            >
              <Check className="h-4 w-4" />
              <span>Xác nhận đã nhận cọc</span>
            </button>
          )}
          {(order.status === "DEPOSITED" || order.status === "PREORDER_DEPOSITED") && (
            <button
              onClick={() => updateStatus("SHIPPING")}
              disabled={processing}
              className="btn-dark"
            >
              <Truck className="h-4 w-4" />
              <span>Chuyển sang đang giao</span>
            </button>
          )}
          {order.status === "SHIPPING" && (
            <button
              onClick={() => updateStatus("COMPLETED")}
              disabled={processing}
              className="btn-primary"
            >
              <Check className="h-4 w-4" />
              <span>Hoàn thành đơn hàng</span>
            </button>
          )}
          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={processing}
              className="btn border border-accent-200 px-4 py-2.5 text-accent-700 hover:bg-accent-50"
            >
              <X className="h-4 w-4" />
              <span>Hủy đơn hàng</span>
            </button>
          )}
          {order.status === "CANCELLED" && (
            <button
              onClick={() => handleAction("restore")}
              disabled={processing}
              className="btn-outline"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Khôi phục đơn</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Thông tin khách hàng</h2>
          </div>
          <div className="divide-y divide-ink-100 px-5 py-2 text-sm">
            <p className="flex justify-between gap-4 py-2">
              <span className="text-ink-500">Họ tên</span>
              <span className="text-right font-medium text-ink-900">{order.customerName}</span>
            </p>
            <p className="flex justify-between gap-4 py-2">
              <span className="text-ink-500">Số điện thoại</span>
              <span className="text-right font-medium text-ink-900">{order.customerPhone}</span>
            </p>
            <p className="flex justify-between gap-4 py-2">
              <span className="text-ink-500">Phương thức nhận hàng</span>
              <span className="text-right font-medium text-ink-900">
                {order.shippingMethod === "STORE_PICKUP" ? "Nhận tại cửa hàng" : "Giao hàng tận nơi"}
              </span>
            </p>
            <p className="flex justify-between gap-4 py-2">
              <span className="text-ink-500">
                {order.shippingMethod === "STORE_PICKUP" ? "Nhận tại" : "Địa chỉ"}
              </span>
              <span className="text-right font-medium text-ink-900">
                {order.shippingMethod === "STORE_PICKUP"
                  ? "Khách tự đến cửa hàng nhận hàng"
                  : order.customerAddress}
              </span>
            </p>
            {order.shippingMethod !== "STORE_PICKUP" && (
              <p className="flex justify-between gap-4 py-2">
                <span className="text-ink-500">Tỉnh/Thành phố</span>
                <span className="text-right font-medium text-ink-900">{order.provinceCity}</span>
              </p>
            )}
            {order.note && (
              <p className="flex justify-between gap-4 py-2">
                <span className="text-ink-500">Ghi chú</span>
                <span className="text-right font-medium text-ink-900">{order.note}</span>
              </p>
            )}
            {order.confirmedDepositBy && (
              <p className="flex justify-between gap-4 py-2">
                <span className="text-ink-500">Xác nhận cọc bởi</span>
                <span className="text-right font-medium text-ink-900">
                  {order.confirmedDepositBy.fullName}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Tóm tắt đơn hàng</h2>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">Tổng tiền hàng</span>
              <span className="font-medium text-ink-900">{formatCurrencyVND(order.totalProductAmount)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">Phí vận chuyển</span>
              <span className="font-medium text-ink-900">{formatCurrencyVND(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-ink-200 pt-3">
              <span className="font-bold text-ink-900">Tiền cọc</span>
              <span className="font-bold text-accent-700">{formatCurrencyVND(order.depositRequired)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="border-b border-ink-200 px-5 py-4">
          <h2 className="text-sm font-bold text-ink-900">Sản phẩm đã đặt</h2>
        </div>
        <div className="divide-y divide-ink-100 px-5">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 py-4">
              <img
                src={item.product.imageUrl}
                alt={item.productName}
                className="h-16 w-16 shrink-0 rounded-md border border-ink-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-ink-900">{item.productName}</h3>
                <p className="mt-0.5 text-[12px] text-ink-500">SKU: {item.product.sku}</p>
                <p className="mt-1 text-[12px] text-ink-600">
                  SL: {item.quantity} x {formatCurrencyVND(item.priceAtOrder)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-ink-900">
                  {formatCurrencyVND(item.priceAtOrder * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status History */}
      <div className="card">
        <div className="border-b border-ink-200 px-5 py-4">
          <h2 className="text-sm font-bold text-ink-900">Lịch sử trạng thái</h2>
        </div>
        <div className="px-5 py-2">
          {order.statusHistories.map((history: any) => (
            <div key={history.id} className="flex items-start gap-3 border-b border-ink-100 py-3 last:border-0">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900">
                  {getStatusLabel(history.fromStatus)} → {getStatusLabel(history.toStatus)}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  {history.actorName} • {new Date(history.createdAt).toLocaleString("vi-VN")}
                </p>
                {history.note && <p className="mt-1 text-[12px] text-ink-600">{history.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lift">
            <div className="border-b border-ink-200 px-5 py-4">
              <h2 className="text-sm font-bold text-ink-950">Hủy đơn hàng</h2>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                  Lý do hủy đơn <span className="text-accent-600">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-outline flex-1"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleAction("cancel", cancelReason)}
                  disabled={!cancelReason || processing}
                  className="btn-primary flex-1"
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
