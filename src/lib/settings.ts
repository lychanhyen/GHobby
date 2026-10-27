import { StoreSettings } from "@/types/product";

export function getStoreSettings(): StoreSettings {
  return {
    shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
    shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
    shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0905.123.456",
    shopEmail: process.env.NEXT_PUBLIC_SHOP_EMAIL || "support@ghobby.vn",
    bankId: process.env.NEXT_PUBLIC_SHOP_BANK_ID || "MB",
    bankAccount: process.env.NEXT_PUBLIC_SHOP_BANK_ACCOUNT || "",
    bankAccountName: process.env.NEXT_PUBLIC_SHOP_BANK_NAME || "GHOBBY SHOP",
    outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
    innerCityDistricts: (process.env.NEXT_PUBLIC_INNER_CITY_DISTRICTS || "")
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean),
  };
}
