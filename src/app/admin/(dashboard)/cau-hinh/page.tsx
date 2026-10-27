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
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Cấu Hình Cửa Hàng</h1>
        <p className="text-slate-600 mt-1">Quản lý thông tin cửa hàng, thanh toán và vận chuyển</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* General Config */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-2">
          <Store className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">Thông tin chung</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tên cửa hàng</label>
              <input
                type="text"
                value={settings.general_config.shopName}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopName: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Hotline</label>
              <input
                type="text"
                value={settings.general_config.shopHotline}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopHotline: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.general_config.shopEmail}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopEmail: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ</label>
              <input
                type="text"
                value={settings.general_config.shopAddress}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, shopAddress: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tỷ lệ cọc (%)</label>
              <input
                type="number"
                value={settings.general_config.depositPercentage}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, depositPercentage: parseInt(e.target.value) } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Thời gian tự hủy đơn (giờ)</label>
              <input
                type="number"
                value={settings.general_config.autoCancelHours}
                onChange={(e) => setSettings({ ...settings, general_config: { ...settings.general_config, autoCancelHours: parseInt(e.target.value) } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave("general_config", settings.general_config)}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình chung</span>
          </button>
        </div>
      </div>

      {/* Bank Config */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">Thông tin chuyển khoản VietQR</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ngân hàng</label>
              <input
                type="text"
                value={settings.bank_config.bankId}
                onChange={(e) => setSettings({ ...settings, bank_config: { ...settings.bank_config, bankId: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="VD: MB"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Số tài khoản</label>
              <input
                type="text"
                value={settings.bank_config.bankAccount}
                onChange={(e) => setSettings({ ...settings, bank_config: { ...settings.bank_config, bankAccount: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tên chủ tài khoản</label>
              <input
                type="text"
                value={settings.bank_config.bankAccountName}
                onChange={(e) => setSettings({ ...settings, bank_config: { ...settings.bank_config, bankAccountName: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave("bank_config", settings.bank_config)}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thông tin ngân hàng</span>
          </button>
        </div>
      </div>

      {/* Shipping Config */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-2">
          <Truck className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">Cấu hình vận chuyển</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phí ship ngoại thành (VNĐ)</label>
              <input
                type="number"
                value={settings.shipping_config.outerCityShippingFee}
                onChange={(e) => setSettings({ ...settings, shipping_config: { ...settings.shipping_config, outerCityShippingFee: parseInt(e.target.value) } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quận/Huyện nội thành (phân cách bởi dấu phẩy)</label>
              <input
                type="text"
                value={settings.shipping_config.innerCityDistricts}
                onChange={(e) => setSettings({ ...settings, shipping_config: { ...settings.shipping_config, innerCityDistricts: e.target.value } })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Hải Châu,Thanh Khê,Sơn Trà"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave("shipping_config", { ...settings.shipping_config, innerCityDistricts: settings.shipping_config.innerCityDistricts.split(",").map((d: string) => d.trim()).filter(Boolean) })}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình vận chuyển</span>
          </button>
        </div>
      </div>
    </div>
  );
}
