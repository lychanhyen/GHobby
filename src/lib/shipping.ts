import { StoreSettings } from "@/types/product";

export function normalizeVi(s: string): string {
  if (!s) return "";
  let str = s.toLowerCase();
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d");
  return str;
}

export type ExpressType = "standard" | "under3km" | "over3km";

export interface ShippingQuoteInput {
  shippingMethod: "DELIVERY" | "STORE_PICKUP";
  expressType?: ExpressType;
  provinceCity?: string;
  customerAddress?: string;
  settings: StoreSettings;
}

export interface ShippingQuoteResult {
  isInnerCity: boolean;
  shippingArea: string;
  shippingFee: number;
  note?: string;
  requiresQuote?: boolean;
  contactZalo?: boolean;
}

export function getShippingQuote({
  shippingMethod,
  expressType = "standard",
  provinceCity,
  customerAddress,
  settings,
}: ShippingQuoteInput): ShippingQuoteResult {
  if (shippingMethod === "STORE_PICKUP") {
    return {
      isInnerCity: true,
      shippingArea: "Tại cửa hàng",
      shippingFee: 0,
      note: "Nhận tại cửa hàng - Miễn phí",
    };
  }

  // Hỏa tốc nội thành: miễn phí trong bán kính 3km.
  if (expressType === "under3km") {
    return {
      isInnerCity: true,
      shippingArea: "Nội thành",
      shippingFee: 0,
      note: "Hỏa tốc dưới 3km - Miễn phí",
    };
  }

  // Trên 3km: không tự động thu phí, khách liên hệ Zalo để shop báo giá.
  if (expressType === "over3km") {
    return {
      isInnerCity: false,
      shippingArea: provinceCity || "Ngoại thành",
      shippingFee: 0,
      note: "Hỏa tốc trên 3km - Liên hệ Zalo để báo phí",
      requiresQuote: true,
      contactZalo: true,
    };
  }

  // Giao hàng tiêu chuẩn toàn quốc - đồng giá.
  return {
    isInnerCity: false,
    shippingArea: provinceCity || "Toàn quốc",
    shippingFee: Number(settings.outerCityShippingFee) || 20000,
    note: "Giao hàng tiêu chuẩn toàn quốc",
  };
}
