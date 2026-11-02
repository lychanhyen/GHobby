import { HeroSlotConfig, HeroSlotMode, StoreSettings } from "@/types/product";
import { prisma } from "@/lib/prisma";

const HERO_SLOT_MODES: HeroSlotMode[] = ["auto", "preorder", "featured"];

export const DEFAULT_HERO_SLOTS: HeroSlotConfig[] = [
  { mode: "auto", productId: "" },
  { mode: "auto", productId: "" },
  { mode: "auto", productId: "" },
];

/** Chuẩn hoá cấu hình 3 ô hero (luôn đủ 3 phần tử, mode hợp lệ). */
export function normalizeHeroSlots(input: unknown): HeroSlotConfig[] {
  return [0, 1, 2].map((index) => {
    const raw = Array.isArray(input) ? (input[index] as any) : null;
    if (!raw || typeof raw !== "object") return { ...DEFAULT_HERO_SLOTS[index] };
    const mode: HeroSlotMode = HERO_SLOT_MODES.includes(raw.mode) ? raw.mode : "auto";
    const productId = typeof raw.productId === "string" ? raw.productId.trim() : "";
    return { mode, productId };
  });
}


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
  brandTagline: "Gunpla & Figure",
  heroEyebrow: "Bandai Spirits · Kotobukiya · Chính hãng",
  heroTitle: "Mô hình chính hãng cho người yêu",
  heroHighlight: "từng chi tiết",
  heroDescription:
    "Gunpla Bandai, figure anime và dụng cụ lắp ráp — chọn kỹ từng sản phẩm, đóng gói cẩn thận, giao đúng hẹn trên toàn quốc.",
  heroBadges: ["HG · RG · MG · PG", "Cọc 10%", "Đóng gói 5 lớp"],
  heroImageUrl: "",
  heroSecondaryImageUrl: "",
  heroSlots: DEFAULT_HERO_SLOTS.map((slot) => ({ ...slot })),
  headerCategoryIds: [],
  headerCategoryLimit: 6,
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
        } else if (setting.key === "homepage_config") {
          if (typeof parsed.brandTagline === "string") merged.brandTagline = parsed.brandTagline;
          if (typeof parsed.heroEyebrow === "string") merged.heroEyebrow = parsed.heroEyebrow;
          if (typeof parsed.heroTitle === "string") merged.heroTitle = parsed.heroTitle;
          if (typeof parsed.heroHighlight === "string") merged.heroHighlight = parsed.heroHighlight;
          if (typeof parsed.heroDescription === "string") merged.heroDescription = parsed.heroDescription;
          if (Array.isArray(parsed.heroBadges)) {
            merged.heroBadges = parsed.heroBadges.map((b: any) => String(b).trim()).filter(Boolean);
          }
          if (typeof parsed.heroImageUrl === "string") merged.heroImageUrl = parsed.heroImageUrl;
          if (typeof parsed.heroSecondaryImageUrl === "string") {
            merged.heroSecondaryImageUrl = parsed.heroSecondaryImageUrl;
          }
          if (parsed.heroSlots !== undefined) {
            merged.heroSlots = normalizeHeroSlots(parsed.heroSlots);
          }
        } else if (setting.key === "header_config") {
          if (Array.isArray(parsed.categoryIds)) {
            merged.headerCategoryIds = parsed.categoryIds.map((id: any) => String(id)).filter(Boolean);
          }
          if (parsed.limit !== undefined && parsed.limit !== null) {
            merged.headerCategoryLimit = Math.max(1, Number(parsed.limit) || 6);
          }
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
