"use client";

import { useState, useEffect } from "react";
import {
  Save,
  CreditCard,
  Truck,
  Store,
  Image as ImageIcon,
  LayoutTemplate,
  ArrowUp,
  ArrowDown,
  X,
  Upload,
  Trash2,
} from "lucide-react";

type HeroSlotDraft = { mode: string; productId: string };

type ShippingMethodDraft = {
  id: string;
  name: string;
  description: string;
  fee: number;
  requiresDeposit: boolean;
  requiresQuote: boolean;
  type: "delivery" | "pickup";
  isActive: boolean;
};

/** Đọc danh sách phương thức giao hàng từ DB thành dữ liệu cho form. */
const normalizeShippingMethodsForForm = (input: any): ShippingMethodDraft[] => {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw: any, index: number) => ({
      id: typeof raw?.id === "string" && raw.id ? raw.id : `method-${index + 1}`,
      name: typeof raw?.name === "string" ? raw.name : "",
      description: typeof raw?.description === "string" ? raw.description : "",
      fee: Math.max(0, Math.round(Number(raw?.fee) || 0)),
      requiresDeposit: raw?.requiresDeposit !== false,
      requiresQuote: raw?.requiresQuote === true,
      type: raw?.type === "pickup" ? ("pickup" as const) : ("delivery" as const),
      isActive: raw?.isActive !== false,
    }))
    .filter((method: ShippingMethodDraft) => method.name.trim().length > 0);
};


const HERO_SLOT_MODE_VALUES = ["auto", "preorder", "featured"];

const HERO_SLOT_LABELS = [
  "Ô 1 · Ảnh lớn (chính)",
  "Ô 2 · Ảnh phụ",
  "Ô 3 · Nền ô hỏa tốc",
];

/** Đọc cấu hình 3 ô hero từ DB thành dữ liệu cho form (luôn đủ 3 ô). */
const normalizeHeroSlotsForForm = (input: any): HeroSlotDraft[] =>
  [0, 1, 2].map((index) => ({
    mode: HERO_SLOT_MODE_VALUES.includes(input?.[index]?.mode)
      ? input[index].mode
      : "auto",
    productId:
      typeof input?.[index]?.productId === "string" ? input[index].productId : "",
  }));

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [uploadingHero, setUploadingHero] = useState<"" | "heroImageUrl" | "heroSecondaryImageUrl">("");

  const [settings, setSettings] = useState({
    bank_config: {
      bankId: "MB",
      bankAccount: "",
      bankAccountName: "",
    },
    shipping_config: {
      outerCityShippingFee: 20000,
      innerCityDistricts: "",
      expressRadiusKm: 3,
      shippingMethods: [] as ShippingMethodDraft[],
    },
    general_config: {
      shopName: "GHobby",
      shopAddress: "",
      shopHotline: "",
      shopEmail: "",
      depositPercentage: 10,
      autoCancelHours: 24,
    },
    homepage_config: {
      brandTagline: "Gunpla & Figure",
      heroEyebrow: "Bandai Spirits · Kotobukiya · Chính hãng",
      heroTitle: "Mô hình chính hãng cho người yêu",
      heroHighlight: "từng chi tiết",
      heroDescription:
        "Gunpla Bandai, figure anime và dụng cụ lắp ráp — chọn kỹ từng sản phẩm, đóng gói cẩn thận, giao đúng hẹn trên toàn quốc.",
      heroBadges: "HG · RG · MG · PG, Cọc 10%, Đóng gói 5 lớp",
      heroImageUrl: "",
      heroSecondaryImageUrl: "",
      heroSlots: [
        { mode: "auto", productId: "" },
        { mode: "auto", productId: "" },
        { mode: "auto", productId: "" },
      ],
    },
    header_config: {
      categoryIds: [] as string[],
      limit: 6,
    },
  });

  useEffect(() => {
    fetchSettings();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products?limit=200");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data?.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setSettings({
          bank_config: data.data.bank_config || settings.bank_config,
          shipping_config: {
            outerCityShippingFee: data.data.shipping_config?.outerCityShippingFee || 20000,
            innerCityDistricts: Array.isArray(data.data.shipping_config?.innerCityDistricts)
              ? data.data.shipping_config.innerCityDistricts.join(",")
              : data.data.shipping_config?.innerCityDistricts || "",
            expressRadiusKm: data.data.shipping_config?.expressRadiusKm || 3,
            shippingMethods: normalizeShippingMethodsForForm(
              data.data.shipping_config?.shippingMethods
            ),
          },
          general_config: data.data.general_config || settings.general_config,
          homepage_config: {
            brandTagline: data.data.homepage_config?.brandTagline || "Gunpla & Figure",
            heroEyebrow:
              data.data.homepage_config?.heroEyebrow ||
              "Bandai Spirits · Kotobukiya · Chính hãng",
            heroTitle:
              data.data.homepage_config?.heroTitle || "Mô hình chính hãng cho người yêu",
            heroHighlight: data.data.homepage_config?.heroHighlight || "từng chi tiết",
            heroDescription:
              data.data.homepage_config?.heroDescription ||
              "Gunpla Bandai, figure anime và dụng cụ lắp ráp — chọn kỹ từng sản phẩm, đóng gói cẩn thận, giao đúng hẹn trên toàn quốc.",
            heroBadges: Array.isArray(data.data.homepage_config?.heroBadges)
              ? data.data.homepage_config.heroBadges.join(", ")
              : data.data.homepage_config?.heroBadges || "",
            heroImageUrl: data.data.homepage_config?.heroImageUrl || "",
            heroSecondaryImageUrl:
              data.data.homepage_config?.heroSecondaryImageUrl || "",
            heroSlots: normalizeHeroSlotsForForm(
              data.data.homepage_config?.heroSlots
            ),
          },
          header_config: {
            categoryIds: Array.isArray(data.data.header_config?.categoryIds)
              ? data.data.header_config.categoryIds
              : [],
            limit: data.data.header_config?.limit ?? 6,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Cập nhật thành công" });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Có lỗi xảy ra" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroImageUrl" | "heroSecondaryImageUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(field);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          homepage_config: {
            ...prev.homepage_config,
            [field]: data.data.url,
          },
        }));
      } else {
        alert(data.message || "Tải ảnh thất bại");
      }
    } catch {
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingHero("");
      e.target.value = "";
    }
  };

  const buildHomepagePayload = (overrides: Record<string, any> = {}) => ({
    ...settings.homepage_config,
    ...overrides,
    heroBadges: settings.homepage_config.heroBadges
      .split(",")
      .map((badge) => badge.trim())
      .filter(Boolean),
  });

  const saveHomepage = () => {
    handleSave("homepage_config", buildHomepagePayload());
  };

  const clearHeroImage = (field: "heroImageUrl" | "heroSecondaryImageUrl") => {
    const overrides = { [field]: "" };
    setSettings((prev) => ({
      ...prev,
      homepage_config: { ...prev.homepage_config, ...overrides },
    }));
    handleSave("homepage_config", buildHomepagePayload(overrides));
  };

  const clearHeroImages = () => {
    const overrides = { heroImageUrl: "", heroSecondaryImageUrl: "" };
    setSettings((prev) => ({
      ...prev,
      homepage_config: { ...prev.homepage_config, ...overrides },
    }));
    handleSave("homepage_config", buildHomepagePayload(overrides));
  };

  const addShippingMethod = () => {
    setSettings((prev) => ({
      ...prev,
      shipping_config: {
        ...prev.shipping_config,
        shippingMethods: [
          ...prev.shipping_config.shippingMethods,
          {
            id: `method-${Date.now()}`,
            name: "",
            description: "",
            fee: Number(prev.shipping_config.outerCityShippingFee) || 20000,
            requiresDeposit: true,
            requiresQuote: false,
            type: "delivery" as const,
            isActive: true,
          },
        ],
      },
    }));
  };

  const updateShippingMethod = (index: number, patch: Partial<ShippingMethodDraft>) => {
    setSettings((prev) => ({
      ...prev,
      shipping_config: {
        ...prev.shipping_config,
        shippingMethods: prev.shipping_config.shippingMethods.map((method, i) =>
          i === index ? { ...method, ...patch } : method
        ),
      },
    }));
  };

  const removeShippingMethod = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      shipping_config: {
        ...prev.shipping_config,
        shippingMethods: prev.shipping_config.shippingMethods.filter((_, i) => i !== index),
      },
    }));
  };

  const saveShipping = () => {
    const methods = settings.shipping_config.shippingMethods
      .filter((method) => method.name.trim().length > 0)
      .map((method) => ({
        ...method,
        name: method.name.trim(),
        description: method.description.trim(),
        fee: Math.max(0, Math.round(Number(method.fee) || 0)),
      }));

    handleSave("shipping_config", {
      ...settings.shipping_config,
      innerCityDistricts: settings.shipping_config.innerCityDistricts
        .split(",")
        .map((district) => district.trim())
        .filter(Boolean),
      shippingMethods: methods,
    });
  };

  const saveHeaderCategories = () => {
    const existingIds = new Set(categories.map((cat) => cat.id));
    handleSave("header_config", {
      categoryIds: settings.header_config.categoryIds.filter((id) => existingIds.has(id)),
      limit: Math.max(1, Number(settings.header_config.limit) || 6),
    });
  };

  const selectedHeaderCategories = settings.header_config.categoryIds
    .map((id) => categories.find((cat) => cat.id === id))
    .filter(Boolean);

  const unselectedHeaderCategories = categories.filter(
    (cat) => !settings.header_config.categoryIds.includes(cat.id)
  );

  const addHeaderCategory = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      header_config: {
        ...prev.header_config,
        categoryIds: [...prev.header_config.categoryIds, id],
      },
    }));
  };

  const removeHeaderCategory = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      header_config: {
        ...prev.header_config,
        categoryIds: prev.header_config.categoryIds.filter((catId) => catId !== id),
      },
    }));
  };

  const moveHeaderCategory = (id: string, direction: -1 | 1) => {
    setSettings((prev) => {
      const ids = [...prev.header_config.categoryIds];
      const index = ids.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ids.length) return prev;
      [ids[index], ids[target]] = [ids[target], ids[index]];
      return {
        ...prev,
        header_config: { ...prev.header_config, categoryIds: ids },
      };
    });
  };

  if (loading) {
    return <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Cấu hình</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Cấu Hình Cửa Hàng
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Quản lý thông tin cửa hàng, thanh toán và vận chuyển
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`rounded-md border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-accent-200 bg-accent-50 text-accent-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* General Config */}
      <div className="card">
        <div className="flex items-center gap-2 border-b border-ink-200 px-5 py-4">
          <Store className="h-4 w-4 text-accent-600" strokeWidth={1.8} />
          <h2 className="text-sm font-bold text-ink-900">Thông tin chung</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tên cửa hàng</label>
              <input
                type="text"
                value={settings.general_config.shopName}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopName: e.target.value } })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Hotline</label>
              <input
                type="text"
                value={settings.general_config.shopHotline}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopHotline: e.target.value } })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Email</label>
              <input
                type="email"
                value={settings.general_config.shopEmail}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopEmail: e.target.value } })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Địa chỉ</label>
              <input
                type="text"
                value={settings.general_config.shopAddress}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopAddress: e.target.value } })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tỷ lệ cọc (%)</label>
              <input
                type="number"
                value={settings.general_config.depositPercentage}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, depositPercentage: parseInt(e.target.value) } })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Thời gian tự hủy đơn (giờ)
              </label>
              <input
                type="number"
                value={settings.general_config.autoCancelHours}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, autoCancelHours: parseInt(e.target.value) } })}
                className="input"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave("general_config", settings.general_config)}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            <span>Lưu cấu hình chung</span>
          </button>
        </div>
      </div>

      {/* Homepage / Hero Config */}
      <div className="card">
        <div className="flex items-center justify-between gap-2 border-b border-ink-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-accent-600" strokeWidth={1.8} />
            <h2 className="text-sm font-bold text-ink-900">Giao diện trang chủ</h2>
          </div>
          {(settings.homepage_config.heroImageUrl ||
            settings.homepage_config.heroSecondaryImageUrl) && (
            <button
              type="button"
              onClick={clearHeroImages}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent-200 px-2.5 py-1.5 text-[11px] font-bold text-accent-700 transition-colors hover:bg-accent-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa ảnh hero
            </button>
          )}
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Tagline dưới logo header
              </label>
              <input
                type="text"
                value={settings.homepage_config.brandTagline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage_config: {
                      ...settings.homepage_config,
                      brandTagline: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="VD: Gunpla & Figure"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Dòng nhỏ trên tiêu đề hero
              </label>
              <input
                type="text"
                value={settings.homepage_config.heroEyebrow}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage_config: {
                      ...settings.homepage_config,
                      heroEyebrow: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="VD: Bandai Spirits · Kotobukiya · Chính hãng"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Tiêu đề hero
              </label>
              <input
                type="text"
                value={settings.homepage_config.heroTitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage_config: {
                      ...settings.homepage_config,
                      heroTitle: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="VD: Mô hình chính hãng cho người yêu"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Chữ nhấn màu đỏ
              </label>
              <input
                type="text"
                value={settings.homepage_config.heroHighlight}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage_config: {
                      ...settings.homepage_config,
                      heroHighlight: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="VD: từng chi tiết"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
              Mô tả hero
            </label>
            <textarea
              rows={3}
              value={settings.homepage_config.heroDescription}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homepage_config: {
                    ...settings.homepage_config,
                    heroDescription: e.target.value,
                  },
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
              Badge hero (cách nhau dấu phẩy)
            </label>
            <input
              type="text"
              value={settings.homepage_config.heroBadges}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homepage_config: {
                    ...settings.homepage_config,
                    heroBadges: e.target.value,
                  },
                })
              }
              className="input"
              placeholder="VD: HG · RG · MG · PG, Cọc 10%, Đóng gói 5 lớp"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Ảnh hero chính
              </label>
              <div className="overflow-hidden rounded-md border border-ink-200 bg-ink-50">
                {settings.homepage_config.heroImageUrl ? (
                  <img
                    src={settings.homepage_config.heroImageUrl}
                    alt="Ảnh hero chính"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-ink-400">
                    Chưa có ảnh riêng — tự động lấy ảnh pre-order đầu tiên, hoặc sản phẩm bán
                    chạy nhất
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="btn-outline cursor-pointer px-3 py-1.5 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingHero === "heroImageUrl" ? "Đang tải..." : "Tải ảnh lên"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingHero !== ""}
                    onChange={(e) => handleHeroImageUpload(e, "heroImageUrl")}
                  />
                </label>
                {settings.homepage_config.heroImageUrl && (
                  <button
                    type="button"
                    onClick={() => clearHeroImage("heroImageUrl")}
                    disabled={saving}
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent-700 hover:text-accent-800 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Ảnh hero phụ
              </label>
              <div className="overflow-hidden rounded-md border border-ink-200 bg-ink-50">
                {settings.homepage_config.heroSecondaryImageUrl ? (
                  <img
                    src={settings.homepage_config.heroSecondaryImageUrl}
                    alt="Ảnh hero phụ"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-ink-400">
                    Chưa có ảnh riêng — tự động lấy ảnh pre-order thứ 2, hoặc sản phẩm bán
                    chạy tiếp theo
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="btn-outline cursor-pointer px-3 py-1.5 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingHero === "heroSecondaryImageUrl" ? "Đang tải..." : "Tải ảnh lên"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingHero !== ""}
                    onChange={(e) => handleHeroImageUpload(e, "heroSecondaryImageUrl")}
                  />
                </label>
                {settings.homepage_config.heroSecondaryImageUrl && (
                  <button
                    type="button"
                    onClick={() => clearHeroImage("heroSecondaryImageUrl")}
                    disabled={saving}
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent-700 hover:text-accent-800 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-ink-200 p-4">
            <p className="text-[12px] font-bold text-ink-800">3 ô ảnh hero</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
              Chọn kiểu hiển thị và sản phẩm cụ thể cho từng ô. Nếu chọn một sản phẩm cụ
              thể, hệ thống sẽ ưu tiên sản phẩm đó thay cho kiểu tự động. Ô hero hiển thị
              sản phẩm pre-order sẽ tự gắn tag “Pre-order”; sản phẩm nổi bật (hàng có sẵn)
              thì không gắn tag.
            </p>

            <div className="mt-3 space-y-2.5">
              {settings.homepage_config.heroSlots.map((slot: HeroSlotDraft, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 items-center gap-2 rounded-md border border-ink-100 bg-ink-50/60 p-3 sm:grid-cols-[130px_1fr_1.3fr]"
                >
                  <p className="text-[12px] font-bold text-ink-700">
                    {HERO_SLOT_LABELS[index]}
                  </p>
                  <select
                    value={slot.mode}
                    onChange={(e) => {
                      const nextSlots = settings.homepage_config.heroSlots.map(
                        (item: HeroSlotDraft, i: number) =>
                          i === index ? { ...item, mode: e.target.value } : item
                      );
                      setSettings({
                        ...settings,
                        homepage_config: {
                          ...settings.homepage_config,
                          heroSlots: nextSlots,
                        },
                      });
                    }}
                    className="input"
                  >
                    <option value="auto">Tự động</option>
                    <option value="preorder">Ưu tiên pre-order</option>
                    <option value="featured">Sản phẩm nổi bật</option>
                  </select>
                  <select
                    value={slot.productId}
                    onChange={(e) => {
                      const nextSlots = settings.homepage_config.heroSlots.map(
                        (item: HeroSlotDraft, i: number) =>
                          i === index ? { ...item, productId: e.target.value } : item
                      );
                      setSettings({
                        ...settings,
                        homepage_config: {
                          ...settings.homepage_config,
                          heroSlots: nextSlots,
                        },
                      });
                    }}
                    className="input"
                  >
                    <option value="">— Tự động chọn sản phẩm —</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                        {product.productType === "PRE_ORDER" ? " · Pre-order" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <p className="rounded-md border border-ink-200 bg-ink-50 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
            Thứ tự ưu tiên cho mỗi ô: sản phẩm cụ thể được chọn → ảnh hero tải lên (ô 1 và
            2) → kiểu tự động (pre-order trước, rồi tới sản phẩm bán chạy). Các ô không
            lấy trùng sản phẩm của nhau. Bấm “Lưu giao diện trang chủ” để áp dụng.
          </p>

          <button onClick={saveHomepage} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            <span>Lưu giao diện trang chủ</span>
          </button>
        </div>
      </div>

      {/* Header Categories Config */}
      <div className="card">
        <div className="flex items-center gap-2 border-b border-ink-200 px-5 py-4">
          <LayoutTemplate className="h-4 w-4 text-accent-600" strokeWidth={1.8} />
          <h2 className="text-sm font-bold text-ink-900">Danh mục trên header</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Số danh mục hiển thị tối đa
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={settings.header_config.limit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    header_config: {
                      ...settings.header_config,
                      limit: parseInt(e.target.value) || 6,
                    },
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-bold text-ink-700">
              Thứ tự hiển thị trên header
            </p>
            {selectedHeaderCategories.length === 0 ? (
              <p className="rounded-md border border-ink-200 bg-ink-50 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
                Chưa chọn danh mục nào. Header sẽ hiển thị tất cả danh mục theo thứ tự A–Z.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedHeaderCategories.map((cat, index) => (
                  <li
                    key={cat.id}
                    className="flex items-center gap-2 rounded-md border border-ink-200 px-3 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-ink-100 text-[11px] font-bold text-ink-600">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-ink-800">
                      {cat.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveHeaderCategory(cat.id, -1)}
                      disabled={index === 0}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                      aria-label="Di chuyển lên"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHeaderCategory(cat.id, 1)}
                      disabled={index === selectedHeaderCategories.length - 1}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                      aria-label="Di chuyển xuống"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHeaderCategory(cat.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-accent-700 hover:bg-accent-50"
                      aria-label="Bỏ khỏi header"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {unselectedHeaderCategories.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-bold text-ink-700">Thêm danh mục</p>
              <div className="flex flex-wrap gap-2">
                {unselectedHeaderCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => addHeaderCategory(cat.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-900 hover:bg-ink-50"
                  >
                    + {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={saveHeaderCategories} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            <span>Lưu danh mục header</span>
          </button>
        </div>
      </div>

      {/* Bank Config */}
      <div className="card">
        <div className="flex items-center gap-2 border-b border-ink-200 px-5 py-4">
          <CreditCard className="h-4 w-4 text-accent-600" strokeWidth={1.8} />
          <h2 className="text-sm font-bold text-ink-900">Thông tin chuyển khoản VietQR</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Ngân hàng</label>
              <input
                type="text"
                value={settings.bank_config.bankId}
                onChange={(e) => setSettings({ ...settings, bank_config: { ...settings.bank_config, bankId: e.target.value } })}
                className="input"
                placeholder="VD: MB"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Số tài khoản</label>
              <input
                type="text"
                value={settings.bank_config.bankAccount}
                onChange={(e) => setSettings({ ...settings, bank_config: { ...settings.bank_config, bankAccount: e.target.value } })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tên chủ tài khoản</label>
              <input
                type="text"
                value={settings.bank_config.bankAccountName}
                onChange={(e) => setSettings({ ...settings, bank_config: { ...settings.bank_config, bankAccountName: e.target.value } })}
                className="input"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave("bank_config", settings.bank_config)}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            <span>Lưu thông tin ngân hàng</span>
          </button>
        </div>
      </div>

      {/* Shipping Config */}
      <div className="card">
        <div className="flex items-center gap-2 border-b border-ink-200 px-5 py-4">
          <Truck className="h-4 w-4 text-accent-600" strokeWidth={1.8} />
          <h2 className="text-sm font-bold text-ink-900">Cấu hình vận chuyển</h2>
        </div>
        <div className="space-y-4 p-5">
          {/* Phương thức giao hàng do shop tự cấu hình */}
          <div className="rounded-lg border border-ink-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-ink-800">Phương thức giao hàng</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                  Thêm, xoá hoặc sửa các phương thức hiển thị ở trang thanh toán. Bỏ chọn
                  “Cần cọc 10%” nếu muốn miễn cọc cho phương thức đó. Phương thức đang tắt
                  sẽ không hiện với khách.
                </p>
              </div>
              <button
                type="button"
                onClick={addShippingMethod}
                disabled={saving || settings.shipping_config.shippingMethods.length >= 10}
                className="btn-outline shrink-0 px-3 py-1.5 text-xs"
              >
                + Thêm phương thức
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {settings.shipping_config.shippingMethods.length === 0 && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-800">
                  Chưa có phương thức nào. Khách sẽ không thể đặt hàng cho đến khi bạn thêm
                  ít nhất một phương thức đang bật.
                </p>
              )}

              {settings.shipping_config.shippingMethods.map((method, index) => (
                <div
                  key={method.id}
                  className="rounded-md border border-ink-200 bg-ink-50/50 p-3"
                >
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-ink-700">
                        Tên phương thức
                      </label>
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) => updateShippingMethod(index, { name: e.target.value })}
                        className="input"
                        placeholder="VD: Giao hàng tiêu chuẩn"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-ink-700">
                        Mô tả hiển thị
                      </label>
                      <input
                        type="text"
                        value={method.description}
                        onChange={(e) =>
                          updateShippingMethod(index, { description: e.target.value })
                        }
                        className="input"
                        placeholder="VD: Toàn quốc · 1–3 ngày"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-ink-700">
                        Phí vận chuyển (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={method.fee}
                        onChange={(e) =>
                          updateShippingMethod(index, {
                            fee: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-ink-700">
                        Hình thức
                      </label>
                      <select
                        value={method.type}
                        onChange={(e) =>
                          updateShippingMethod(index, {
                            type: e.target.value === "pickup" ? "pickup" : "delivery",
                          })
                        }
                        className="input"
                      >
                        <option value="delivery">Giao tận nơi (cần địa chỉ)</option>
                        <option value="pickup">Nhận tại cửa hàng (không cần địa chỉ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={method.requiresDeposit}
                        onChange={(e) =>
                          updateShippingMethod(index, { requiresDeposit: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-ink-300 text-accent-600"
                      />
                      <span className="font-medium text-ink-700">Cần cọc 10%</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={method.requiresQuote}
                        onChange={(e) =>
                          updateShippingMethod(index, { requiresQuote: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-ink-300 text-accent-600"
                      />
                      <span className="font-medium text-ink-700">
                        Báo phí qua Zalo (khách không đặt trực tiếp)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={method.isActive}
                        onChange={(e) =>
                          updateShippingMethod(index, { isActive: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-ink-300 text-accent-600"
                      />
                      <span className="font-medium text-ink-700">Đang bật</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeShippingMethod(index)}
                      disabled={saving}
                      className="ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-accent-700 hover:text-accent-800 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xoá
                    </button>
                  </div>

                  {!method.requiresDeposit && (
                    <p className="mt-1.5 text-[11px] font-medium text-emerald-700">
                      Phương thức này được miễn cọc 10% cho khách.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Phí giao hàng tiêu chuẩn toàn quốc (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={settings.shipping_config.outerCityShippingFee}
                onChange={(e) => setSettings({ ...settings, shipping_config: { ...settings.shipping_config, outerCityShippingFee: parseInt(e.target.value) } })}
                className="input"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                Dùng cho phần giới thiệu trên website và làm phí mặc định khi thêm phương
                thức mới.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Bán kính giao hỏa tốc miễn phí (km)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                step={1}
                value={settings.shipping_config.expressRadiusKm ?? 3}
                onChange={(e) => setSettings({ ...settings, shipping_config: { ...settings.shipping_config, expressRadiusKm: parseInt(e.target.value) || 3 } })}
                className="input"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                Dùng cho phần giới thiệu trên website. Phí thực tế do các phương thức giao
                hàng ở trên quyết định.
              </p>
            </div>
          </div>
          <p className="rounded-md border border-ink-200 bg-ink-50 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
            Khách chỉ thấy các phương thức đang bật và không ở chế độ “Báo phí qua Zalo”.
            Phương thức miễn cọc sẽ tạo đơn không cần thanh toán 10% và không bị tự huỷ sau
            24 giờ.
          </p>
          <button
            onClick={saveShipping}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="h-4 w-4" />
            <span>Lưu cấu hình vận chuyển</span>
          </button>
        </div>
      </div>
    </div>
  );
}
