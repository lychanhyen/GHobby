import { ShippingMethodConfig, StoreSettings } from "@/types/product";

export const MAX_SHIPPING_METHODS = 10;

/**
 * 4 phương thức giao hàng mặc định (tương thích hành vi cũ):
 * giao tiêu chuẩn, hỏa tốc gần (miễn phí), hỏa tốc xa (báo phí qua Zalo), nhận tại cửa hàng.
 * Shop có thể sửa/xoá/thêm phương thức khác trong trang Cấu hình.
 */
export function buildDefaultShippingMethods(
  settings?: Pick<StoreSettings, "outerCityShippingFee" | "expressRadiusKm"> | null
): ShippingMethodConfig[] {
  const standardFee = Math.max(0, Math.round(Number(settings?.outerCityShippingFee) || 20000));
  const radius = Math.max(1, Math.round(Number(settings?.expressRadiusKm) || 3));

  return [
    {
      id: "standard",
      name: "Giao hàng tiêu chuẩn",
      description: "Toàn quốc · 1–3 ngày",
      fee: standardFee,
      requiresDeposit: true,
      requiresQuote: false,
      type: "delivery",
      isActive: true,
    },
    {
      id: "express-near",
      name: `Hỏa tốc dưới ${radius}km`,
      description: "Nội thành · trong 2 giờ",
      fee: 0,
      requiresDeposit: true,
      requiresQuote: false,
      type: "delivery",
      isActive: true,
    },
    {
      id: "express-far",
      name: `Hỏa tốc trên ${radius}km`,
      description: "Shop báo phí qua Zalo trước khi giao",
      fee: 0,
      requiresDeposit: true,
      requiresQuote: true,
      type: "delivery",
      isActive: true,
    },
    {
      id: "pickup",
      name: "Nhận tại cửa hàng",
      description: "Tự đến cửa hàng nhận hàng",
      fee: 0,
      requiresDeposit: true,
      requiresQuote: false,
      type: "pickup",
      isActive: true,
    },
  ];
}

function sanitizeMethodId(value: string, fallbackId: string): string {
  const id = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id || fallbackId;
}

/**
 * Chuẩn hoá danh sách phương thức giao hàng đọc từ DB:
 * - Bỏ phương thức không có tên.
 * - Mã phương thức duy nhất, viết thường, không khoảng trắng.
 * - Phí là số nguyên >= 0; các cờ boolean được đọc an toàn.
 */
export function normalizeShippingMethods(
  input: unknown,
  fallback: ShippingMethodConfig[] = []
): ShippingMethodConfig[] {
  if (!Array.isArray(input)) return fallback;

  const result: ShippingMethodConfig[] = [];
  const usedIds = new Set<string>();

  for (const raw of input.slice(0, MAX_SHIPPING_METHODS)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;

    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) continue;

    let id = sanitizeMethodId(
      typeof item.id === "string" ? item.id : "",
      `method-${result.length + 1}`
    );
    if (usedIds.has(id)) id = `${id}-${result.length + 1}`;
    usedIds.add(id);

    result.push({
      id,
      name: name.slice(0, 120),
      description:
        typeof item.description === "string" ? item.description.trim().slice(0, 200) : "",
      fee: Math.max(0, Math.round(Number(item.fee) || 0)),
      requiresDeposit: item.requiresDeposit !== false,
      requiresQuote: item.requiresQuote === true,
      type: item.type === "pickup" ? "pickup" : "delivery",
      isActive: item.isActive !== false,
    });
  }

  return result.length > 0 ? result : fallback;
}

/** Danh sách phương thức đang bật (dùng cho trang thanh toán). */
export function getActiveShippingMethods(
  settings?: Pick<StoreSettings, "shippingMethods" | "outerCityShippingFee" | "expressRadiusKm"> | null
): ShippingMethodConfig[] {
  const methods =
    Array.isArray(settings?.shippingMethods) && settings.shippingMethods.length > 0
      ? settings.shippingMethods
      : buildDefaultShippingMethods(settings);
  return methods.filter((method) => method.isActive);
}

/** Phương thức mặc định khi khách vào trang thanh toán. */
export function getDefaultShippingMethod(
  methods: ShippingMethodConfig[]
): ShippingMethodConfig | null {
  return (
    methods.find((method) => method.type === "delivery" && !method.requiresQuote) ||
    methods[0] ||
    null
  );
}
