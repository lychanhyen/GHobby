"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    categoryId: "",
    brand: "",
    scale: "",
    series: "",
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStockAlert: 2,
    productType: "IN_STOCK",
    expectedReleaseDate: "",
    preOrderLimit: 0,
    imageUrl: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ ...formData, imageUrl: data.data.url });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert("Tạo sản phẩm thành công");
        router.push("/admin/san-pham");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const depositAmount = Math.round((formData.sellingPrice * 10) / 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Thêm sản phẩm mới</h1>
        <p className="text-slate-600 mt-1">Tạo sản phẩm mới trong hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Thông tin cơ bản</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hãng sản xuất</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Bandai Spirits"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tỷ lệ</label>
                <input
                  type="text"
                  value={formData.scale}
                  onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="1/144, 1/100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Series</label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-sleet-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Universal Century"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Giá bán & Kho hàng</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Giá bán (VNĐ) *</label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Giá vốn (VNĐ)</label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tiền cọc 10%</label>
                <input
                  type="text"
                  value={depositAmount.toLocaleString("vi-VN") + " VNĐ"}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ngưỡng cảnh báo</label>
                <input
                  type="number"
                  value={formData.minStockAlert}
                  onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 2 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="IN_STOCK">Có sẵn</option>
                  <option value="PRE_ORDER">Pre-order</option>
                </select>
              </div>
            </div>

            {formData.productType === "PRE_ORDER" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngày phát hành dự kiến</label>
                  <input
                    type="date"
                    value={formData.expectedReleaseDate}
                    onChange={(e) => setFormData({ ...formData, expectedReleaseDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Giới hạn số suất đặt trước</label>
                  <input
                    type="number"
                    value={formData.preOrderLimit}
                    onChange={(e) => setFormData({ ...formData, preOrderLimit: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Ảnh sản phẩm</h2>
          </div>
          <div className="p-6 space-y-4">
            {formData.imageUrl ? (
              <div className="relative w-48 h-48">
                <img
                  src={formData.imageUrl}
                  alt="Product"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="mb-2 text-sm text-slate-500">
                    <span className="font-bold">Nhấn để tải lên</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, WebP (Tối đa 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
            {uploading && <p className="text-sm text-slate-600">Đang xử lý ảnh...</p>}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Mô tả sản phẩm *</h2>
          </div>
          <div className="p-6">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={8}
              placeholder="Mô tả chi tiết sản phẩm..."
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || uploading || !formData.imageUrl}
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
