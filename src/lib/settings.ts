import { StoreSettings } from "@/types/product";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS: StoreSettings = {
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
  expressRadiusKm: Number(process.env.NEXT_PUBLIC_EXPRESS_RADIUS_KM) || 3,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const storeSettings = await prisma.storeSetting.findMany();

    const merged: StoreSettings = { ...DEFAULT_SETTINGS };

    for (const setting of storeSettings) {
      try {
        const parsed = JSON.parse(setting.value);

        if (setting.key === "general_config") {
          if (parsed.shopName) merged.shopName = parsed.shopName;
          if (parsed.shopAddress) merged.shopAddress = parsed.shopAddress;
          if (parsed.shopHotline) merged.shopHotline = parsed.shopHotline;
          if (parsed.shopEmail) merged.shopEmail = parsed.shopEmail;
        } else if (setting.key === "shipping_config") {
          if (parsed.outerCityShippingFee !== undefined && parsed.outerCityShippingFee !== null) {
            merged.outerCityShippingFee = Number(parsed.outerCityShippingFee) || merged.outerCityShippingFee;
          }
          if (parsed.expressRadiusKm !== undefined && parsed.expressRadiusKm !== null) {
            merged.expressRadiusKm = Number(parsed.expressRadiusKm) || merged.expressRadiusKm || 3;
          }
          if (Array.isArray(parsed.innerCityDistricts)) {
            merged.innerCityDistricts = parsed.innerCityDistricts
              .map((d: string) => String(d).trim())
              .filter(Boolean);
          }
        } else if (setting.key === "bank_config") {
          if (parsed.bankId) merged.bankId = parsed.bankId;
          if (parsed.bankAccount) merged.bankAccount = parsed.bankAccount;
          if (parsed.bankAccountName) merged.bankAccountName = parsed.bankAccountName;
        }
      } catch {
        // skip invalid JSON
      }
    }

    return merged;
  } catch (error) {
    console.error("[getStoreSettings] Failed to load from DB, falling back to env:", error);
    return { ...DEFAULT_SETTINGS };
  }
}
