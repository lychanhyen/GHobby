import { StoreSettings } from "@/types/product";

export function normalizeVi(s: string): string {
  if (!s) return "";
  let str = s.toLowerCase();
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d");
  return str;
}

export interface ShippingQuoteInput {
  shippingMethod: "DELIVERY" | "STORE_PICKUP";
  provinceCity?: string;
  customerAddress?: string;
  settings: StoreSettings;
}

export interface ShippingQuoteResult {
  isInnerCity: boolean;
  shippingArea: string;
  shippingFee: number;
  note?: string;
}

export function getShippingQuote({
  shippingMethod,
  provinceCity,
  customerAddress,
  settings,
}: ShippingQuoteInput): ShippingQuoteResult {
  if (shippingMethod === "STORE_PICKUP") {
    return {
      isInnerCity: true,
      shippingArea: "Tại cửa hàng",
      shippingFee: 0,
      note: "Nhận tại cửa hàng",
    };
  }

  const innerDistricts = settings.innerCityDistricts || [];
  if (innerDistricts.length === 0) {
    return {
      isInnerCity: false,
      shippingArea: provinceCity || "Ngoại thành",
      shippingFee: Number(settings.outerCityShippingFee) || 20000,
    };
  }

  const combined = normalizeVi(`${provinceCity || ""} ${customerAddress || ""}`);
  for (const district of innerDistricts) {
    const nd = normalizeVi(district);
    if (!nd) continue;
    if (combined.includes(nd)) {
      return {
        isInnerCity: true,
        shippingArea: "Nội thành",
        shippingFee: 0,
        note: "Shop sẽ liên hệ báo phí ship hỏa tốc qua Zalo",
      };
    }
  }

  return {
    isInnerCity: false,
    shippingArea: provinceCity || "Ngoại thành",
    shippingFee: Number(settings.outerCityShippingFee) || 20000,
  };
}
