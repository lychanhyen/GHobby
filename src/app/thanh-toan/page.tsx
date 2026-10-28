"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/utils";
import { Truck, Store, MapPin, Phone, ArrowRight, Zap } from "lucide-react";
import { getShippingQuote } from "@/lib/shipping";

type ShippingMethod = "DELIVERY" | "STORE_PICKUP";
type ShippingOption = "STANDARD" | "EXPRESS_NEAR" | "EXPRESS_FAR" | "STORE_PICKUP";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, getTotalPrice, getDepositAmount, clearCart, hasMixedCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingOption, setShippingOption] = useState<ShippingOption>("STANDARD");
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
      <div className="container-page py-16 text-center text-sm text-ink-500">
        Đang tải...
      </div>
    );
  }

  const shippingMethod: ShippingMethod =
    shippingOption === "STORE_PICKUP" ? "STORE_PICKUP" : "DELIVERY";
  const expressType =
    shippingOption === "EXPRESS_NEAR"
      ? "under3km"
      : shippingOption === "EXPRESS_FAR"
        ? "over3km"
        : "standard";
  const isStorePickup = shippingOption === "STORE_PICKUP";
  const requiresZaloQuote = shippingOption === "EXPRESS_FAR";
  const zaloHref = `https://zalo.me/${(settings.shopHotline || "").replace(/\D/g, "")}`;
  const expressRadiusKm = settings.expressRadiusKm ?? 3;
  const quote = getShippingQuote({
    shippingMethod,
    expressType,
    provinceCity: formData.provinceCity,
    customerAddress: formData.customerAddress,
    settings,
  });
  const shippingFee = quote.shippingFee;
  const shippingNote = quote.note;

  if (!isHydrated) {
    return (
      <div className="container-page py-16 text-center text-sm text-ink-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (!orderPlaced && items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-lg border border-ink-200 bg-white p-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-ink-950">Giỏ hàng trống</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Vui lòng thêm sản phẩm vào giỏ hàng để tiến hành thanh toán.
          </p>
          <button
            type="button"
            onClick={() => router.push("/gio-hang")}
            className="btn-dark mt-5 px-5"
          >
            Về giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  if (hasMixedCart()) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-ink-950">
            Không thể đặt đơn hỗn hợp
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">
            Không thể đặt đơn hỗn hợp hàng có sẵn và pre-order. Vui lòng tách thành 2 đơn riêng biệt.
          </p>
          <button
            type="button"
            onClick={() => router.push("/gio-hang")}
            className="btn-dark mt-5 px-5"
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
    if (requiresZaloQuote) {
      setErrors((prev) => ({
        ...prev,
        form: "Đơn hỏa tốc trên 3km cần shop báo phí trước. Vui lòng nhắn Zalo để được xác nhận.",
      }));
      return;
    }
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
          expressType: expressType,
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

  const fieldError = (key: string) =>
    errors[key] ? "border-accent-300 focus:border-accent-600 focus:ring-accent-600/10" : "";

  const shippingChoices: Array<{
    id: ShippingOption;
    icon: typeof Truck;
    title: string;
    description: string;
    price: string;
  }> = [
    {
      id: "STANDARD",
      icon: Truck,
      title: "Giao hàng tiêu chuẩn",
      description: "Toàn quốc · 1–3 ngày",
      price: formatCurrencyVND(settings.outerCityShippingFee),
    },
    {
      id: "EXPRESS_NEAR",
      icon: Zap,
      title: `Hỏa tốc dưới ${expressRadiusKm}km`,
      description: "Nội thành · trong 2 giờ",
      price: "Miễn phí",
    },
    {
      id: "EXPRESS_FAR",
      icon: MapPin,
      title: `Hỏa tốc trên ${expressRadiusKm}km`,
      description: `Ngoài bán kính ${expressRadiusKm}km · shop báo phí trước`,
      price: "Báo phí qua Zalo",
    },
    {
      id: "STORE_PICKUP",
      icon: Store,
      title: "Nhận tại cửa hàng",
      description: "Tự đến shop lấy hàng",
      price: "Miễn phí",
    },
  ];

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <p className="eyebrow">Thanh toán</p>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          Thanh toán
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Hoàn tất thông tin nhận hàng và xác nhận đơn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Checkout Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6"
            noValidate
          >
            <h2 className="text-base font-bold text-ink-950">Thông tin nhận hàng</h2>
            <p className="mt-1 text-xs text-ink-500">
              Các trường có dấu * là bắt buộc.
            </p>

            {errors.form && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700"
              >
                {errors.form}
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-[13px] font-bold text-ink-800">
                Phương thức giao hàng *
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shippingChoices.map((choice) => {
                  const Icon = choice.icon;
                  const selected = shippingOption === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setShippingOption(choice.id)}
                      aria-pressed={selected}
                      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-200 ${
                        selected
                          ? "border-ink-900 bg-ink-50"
                          : "border-ink-200 bg-white hover:border-ink-400"
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          selected ? "text-ink-900" : "text-ink-400"
                        }`}
                        strokeWidth={1.7}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink-950">{choice.title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                          {choice.description}
                        </span>
                        <span
                          className={`mt-1.5 block text-xs font-bold ${
                            choice.id === "EXPRESS_FAR" ? "text-amber-700" : "text-ink-900"
                          }`}
                        >
                          {choice.price}
                        </span>
                      </span>
                      <span
                        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-ink-900 bg-ink-900" : "border-ink-300"
                        }`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                Hỏa tốc miễn phí trong bán kính {expressRadiusKm}km quanh cửa hàng. Địa chỉ trên{" "}
                {expressRadiusKm}km vui lòng nhắn Zalo để shop báo phí trước khi giao.
              </p>
            </div>

            {requiresZaloQuote && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-900">
                  Hỏa tốc trên {expressRadiusKm}km cần báo phí
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Shop không tự thu phí hỏa tốc cho khoảng cách trên {expressRadiusKm}km. Nhắn Zalo
                  để được báo phí và chốt đơn trước khi giao.
                </p>
                <a
                  href={zaloHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-dark mt-3 px-4"
                >
                  Nhắn Zalo {settings.shopHotline}
                </a>
              </div>
            )}

            {isStorePickup && (
              <div className="mt-4 space-y-2 rounded-lg border border-ink-200 bg-ink-50 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <Store className="h-4 w-4 text-ink-500" />
                  <span>Địa chỉ nhận hàng tại GHobby</span>
                </p>
                <p className="flex items-start gap-2 text-sm text-ink-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <span>{settings.shopAddress}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-ink-700">
                  <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>Hotline: {settings.shopHotline}</span>
                </p>
                <p className="text-xs leading-relaxed text-ink-500">
                  Bạn không cần nhập địa chỉ giao hàng. Vui lòng đến cửa hàng sau khi đơn được xác nhận.
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                  Họ và tên *
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => {
                    setFormData({ ...formData, customerName: e.target.value });
                    if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: "" }));
                  }}
                  aria-invalid={Boolean(errors.customerName)}
                  className={`input ${fieldError("customerName")}`}
                />
                {errors.customerName && (
                  <p className="mt-1.5 text-xs text-accent-700">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerPhone" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                  Số điện thoại *
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => {
                    setFormData({ ...formData, customerPhone: e.target.value });
                    if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: "" }));
                  }}
                  aria-invalid={Boolean(errors.customerPhone)}
                  className={`input ${fieldError("customerPhone")}`}
                />
                {errors.customerPhone && (
                  <p className="mt-1.5 text-xs text-accent-700">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            {!isStorePickup && (
              <>
                <div className="mt-4">
                  <label htmlFor="provinceCity" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    id="provinceCity"
                    type="text"
                    value={formData.provinceCity}
                    onChange={(e) => {
                      setFormData({ ...formData, provinceCity: e.target.value });
                      if (errors.provinceCity) setErrors((prev) => ({ ...prev, provinceCity: "" }));
                    }}
                    aria-invalid={Boolean(errors.provinceCity)}
                    className={`input ${fieldError("provinceCity")}`}
                    placeholder="VD: Đà Nẵng, TP. Hồ Chí Minh"
                  />
                  {errors.provinceCity && (
                    <p className="mt-1.5 text-xs text-accent-700">{errors.provinceCity}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="customerAddress" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                    Địa chỉ giao hàng *
                  </label>
                  <textarea
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, customerAddress: e.target.value });
                      if (errors.customerAddress) setErrors((prev) => ({ ...prev, customerAddress: "" }));
                    }}
                    aria-invalid={Boolean(errors.customerAddress)}
                    className={`input ${fieldError("customerAddress")}`}
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  />
                  {errors.customerAddress && (
                    <p className="mt-1.5 text-xs text-accent-700">{errors.customerAddress}</p>
                  )}
                </div>
              </>
            )}

            <div className="mt-4">
              <label htmlFor="note" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Ghi chú
              </label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(e) => {
                  setFormData({ ...formData, note: e.target.value });
                  if (errors.note) setErrors((prev) => ({ ...prev, note: "" }));
                }}
                aria-invalid={Boolean(errors.note)}
                className={`input ${fieldError("note")}`}
                rows={2}
              />
              {errors.note && (
                <p className="mt-1.5 text-xs text-accent-700">{errors.note}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || requiresZaloQuote}
              className="btn-primary mt-5 h-11 w-full px-5"
            >
              {requiresZaloQuote
                ? "Nhắn Zalo để báo phí hỏa tốc"
                : loading
                  ? "Đang xử lý..."
                  : "Đặt hàng"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-ink-200 bg-white p-5">
            <h2 className="text-base font-bold text-ink-950">Đơn hàng của bạn</h2>

            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-14 w-14 shrink-0 rounded-md border border-ink-100 bg-ink-50 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-ink-950">
                      {item.product.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-500">SL: {item.quantity}</p>
                    <p className="mt-0.5 text-xs font-bold text-ink-900">
                      {formatCurrencyVND(item.product.sellingPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-ink-200 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3 text-ink-600">
                <span>Tổng tiền hàng</span>
                <span className="font-medium text-ink-900">{formatCurrencyVND(getTotalPrice())}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-ink-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-ink-900">
                  {requiresZaloQuote
                    ? "Liên hệ Zalo"
                    : shippingFee === 0
                      ? "Miễn phí"
                      : formatCurrencyVND(shippingFee)}
                </span>
              </div>
              {shippingNote && (
                <p className="text-[11px] leading-relaxed text-ink-400">{shippingNote}</p>
              )}
              <div className="flex items-end justify-between gap-3 border-t border-ink-100 pt-2.5">
                <span className="font-bold text-ink-900">Tổng giá trị đơn hàng</span>
                <span className="text-lg font-bold leading-none tracking-tight text-ink-950">
                  {formatCurrencyVND(getTotalPrice() + shippingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-amber-700">Tiền cọc cần thanh toán (10%)</span>
                <span className="font-bold text-amber-700">
                  {formatCurrencyVND(Math.round(getTotalPrice() * 0.1))}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              Sau khi đặt hàng, bạn sẽ được chuyển đến trang xác nhận đơn hàng kèm mã QR VietQR
              (nếu thanh toán chuyển khoản).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
