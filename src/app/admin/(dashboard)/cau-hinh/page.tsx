"use client";

import { useState, useEffect } from "react";
import { Save, CreditCard, Truck, Store } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
    },
    general_config: {
      shopName: "GHobby",
      shopAddress: "",
      shopHotline: "",
      shopEmail: "",
      depositPercentage: 10,
      autoCancelHours: 24,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

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
          },
          general_config: data.data.general_config || settings.general_config,
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
            </div>
          </div>
          <p className="rounded-md border border-ink-200 bg-ink-50 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
            Hỏa tốc trong bán kính {settings.shipping_config.expressRadiusKm ?? 3}km được miễn phí.
            Địa chỉ ngoài bán kính này khách liên hệ Zalo để shop báo phí trước khi giao; hệ thống
            không tự thu phí hỏa tốc.
          </p>
          <button
            onClick={() => handleSave("shipping_config", { ...settings.shipping_config, innerCityDistricts: settings.shipping_config.innerCityDistricts.split(",").map((d: string) => d.trim()).filter(Boolean) })}
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
