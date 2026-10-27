"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/utils";
import { Truck, Store, MapPin, Phone } from "lucide-react";
import { getShippingQuote } from "@/lib/shipping";

type ShippingMethod = "DELIVERY" | "STORE_PICKUP";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, getTotalPrice, getDepositAmount, clearCart, hasMixedCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("DELIVERY");
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    provinceCity: "",
    note: "",
  });
  const [settings, setSettings] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setSettings(data.data);
            return;
          }
        }
      } catch {}
      setSettings({
        shopName: "GHobby Model Kit Shop",
        shopAddress: "Việt Nam",
        shopHotline: "0905.123.456",
        outerCityShippingFee: 20000,
        innerCityDistricts: [],
      });
    };
    fetchSettings();
  }, []);

  if (!settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-600">
        Đang tải...
      </div>
    );
  }

  const isStorePickup = shippingMethod === "STORE_PICKUP";
  const quote = getShippingQuote({
    shippingMethod,
    provinceCity: formData.provinceCity,
    customerAddress: formData.customerAddress,
    settings,
  });
  const shippingFee = quote.shippingFee;
  const shippingNote = quote.note;

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-600">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (!orderPlaced && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <h1 className="text-xl font-black text-slate-900">Giỏ hàng trống</h1>
          <p className="text-slate-600 text-sm">Vui lòng thêm sản phẩm vào giỏ hàng để tiến hành thanh toán.</p>
          <button
            onClick={() => router.push("/gio-hang")}
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
          >
            Về giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  if (hasMixedCart()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
          <h1 className="text-xl font-black text-slate-900">Không thể đặt đơn hỗn hợp</h1>
          <p className="text-slate-700 text-sm">Không thể đặt đơn hỗn hợp hàng có sẵn và pre-order. Vui lòng tách thành 2 đơn riêng biệt.</p>
          <button
            onClick={() => router.push("/gio-hang")}
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
          >
            Về giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      newErrors.customerName = "Vui lòng nhập họ tên hợp lệ (tối thiểu 2 ký tự)";
    }
    const phoneDigits = formData.customerPhone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 9 || phoneDigits.length > 11) {
      newErrors.customerPhone = "Vui lòng nhập số điện thoại hợp lệ";
    }
    if (shippingMethod === "DELIVERY") {
      if (!formData.provinceCity.trim()) {
        newErrors.provinceCity = "Vui lòng nhập tỉnh/thành phố";
      }
      if (!formData.customerAddress.trim()) {
        newErrors.customerAddress = "Vui lòng nhập địa chỉ giao hàng";
      }
    }
    if (formData.note && formData.note.length > 500) {
      newErrors.note = "Ghi chú không được vượt quá 500 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shippingMethod,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.orderId) {
        setOrderPlaced(true);
        clearCart();
        const tokenQuery = data.data.viewToken
          ? `?token=${encodeURIComponent(data.data.viewToken)}`
          : "";
        router.push(`/thanh-toan/thanh-cong/${data.data.orderId}${tokenQuery}`);
      } else {
        setErrors((prev) => ({ ...prev, form: data.message || "Không thể tạo đơn hàng" }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: "Có lỗi xảy ra khi đặt hàng" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin nhận hàng</h2>
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Phương thức giao hàng *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShippingMethod("DELIVERY")}
                  aria-pressed={shippingMethod === "DELIVERY"}
                  className={`flex items-start space-x-3 rounded-xl border-2 p-4 text-left transition-colors ${
                    shippingMethod === "DELIVERY"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Truck
                    className={`w-6 h-6 flex-shrink-0 ${
                      shippingMethod === "DELIVERY" ? "text-red-600" : "text-slate-500"
                    }`}
                  />
                  <span>
                    <span className="block font-bold text-slate-900">Giao hàng tận nơi</span>
                    <span className="block text-xs text-slate-600 mt-1">
                      Phí vận chuyển {formatCurrencyVND(settings.outerCityShippingFee)}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("STORE_PICKUP")}
                  aria-pressed={shippingMethod === "STORE_PICKUP"}
                  className={`flex items-start space-x-3 rounded-xl border-2 p-4 text-left transition-colors ${
                    shippingMethod === "STORE_PICKUP"
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Store
                    className={`w-6 h-6 flex-shrink-0 ${
                      shippingMethod === "STORE_PICKUP" ? "text-red-600" : "text-slate-500"
                    }`}
                  />
                  <span>
                    <span className="block font-bold text-slate-900">Nhận tại cửa hàng</span>
                    <span className="block text-xs text-slate-600 mt-1">
                      Miễn phí vận chuyển, tự đến shop lấy hàng
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {isStorePickup && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
                <p className="flex items-center space-x-2 font-bold text-blue-900">
                  <Store className="w-5 h-5" />
                  <span>Địa chỉ nhận hàng tại GHobby</span>
                </p>
                <p className="flex items-start space-x-2 text-sm text-blue-800">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{settings.shopAddress}</span>
                </p>
                <p className="flex items-center space-x-2 text-sm text-blue-800">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>Hotline: {settings.shopHotline}</span>
                </p>
                <p className="text-xs text-blue-700">
                  Bạn không cần nhập địa chỉ giao hàng. Vui lòng đến cửa hàng sau khi đơn được xác nhận.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => {
                  setFormData({ ...formData, customerName: e.target.value });
                  if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.customerName ? "border-red-500" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => {
                  setFormData({ ...formData, customerPhone: e.target.value });
                  if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.customerPhone ? "border-red-500" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.customerPhone && <p className="text-xs text-red-600 mt-1">{errors.customerPhone}</p>}
            </div>

            {!isStorePickup && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    value={formData.provinceCity}
                    onChange={(e) => {
                      setFormData({ ...formData, provinceCity: e.target.value });
                      if (errors.provinceCity) setErrors((prev) => ({ ...prev, provinceCity: "" }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.provinceCity ? "border-red-500" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                    placeholder="VD: Đà Nẵng, TP. Hồ Chí Minh"
                  />
                  {errors.provinceCity && <p className="text-xs text-red-600 mt-1">{errors.provinceCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ giao hàng *</label>
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, customerAddress: e.target.value });
                      if (errors.customerAddress) setErrors((prev) => ({ ...prev, customerAddress: "" }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.customerAddress ? "border-red-500" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  />
                  {errors.customerAddress && <p className="text-xs text-red-600 mt-1">{errors.customerAddress}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.note}
                onChange={(e) => {
                  setFormData({ ...formData, note: e.target.value });
                  if (errors.note) setErrors((prev) => ({ ...prev, note: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.note ? "border-red-500" : "border-slate-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                rows={2}
              />
              {errors.note && <p className="text-xs text-red-600 mt-1">{errors.note}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex space-x-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                    <p className="text-sm text-slate-900">{formatCurrencyVND(item.product.sellingPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền hàng</span>
                <span>{formatCurrencyVND(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span>{isStorePickup ? "Miễn phí" : formatCurrencyVND(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                <span>Tổng giá trị đơn hàng</span>
                <span>{formatCurrencyVND(getTotalPrice() + shippingFee)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold">
                <span>Tiền cọc cần thanh toán (10%)</span>
                <span>{formatCurrencyVND(Math.round(getTotalPrice() * 0.1))}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Sau khi đặt hàng, bạn sẽ được chuyển đến trang xác nhận đơn hàng kèm mã QR VietQR
              (nếu thanh toán chuyển khoản).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
