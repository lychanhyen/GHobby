"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Upload, X } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    fetchProduct();
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

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();
      if (data.success) {
        const product = data.data;
        setFormData({
          sku: product.sku,
          name: product.name,
          categoryId: product.categoryId,
          brand: product.brand,
          scale: product.scale,
          series: product.series,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          stockQuantity: product.stockQuantity,
          minStockAlert: product.minStockAlert,
          productType: product.productType,
          expectedReleaseDate: product.expectedReleaseDate ? new Date(product.expectedReleaseDate).toISOString().split('T')[0] : "",
          preOrderLimit: product.preOrderLimit,
          imageUrl: product.imageUrl,
          description: product.description,
          isActive: product.isActive,
        });
      } else {
        alert(data.message);
        router.push("/admin/san-pham");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert("Cập nhật sản phẩm thành công");
        router.push("/admin/san-pham");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const depositAmount = Math.round((formData.sellingPrice * 10) / 100);

  if (loading) {
    return <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="eyebrow">Sản phẩm</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          Chỉnh sửa sản phẩm
        </h1>
        <p className="mt-1 text-sm text-ink-500">Cập nhật thông tin sản phẩm</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Thông tin cơ bản</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                  SKU <span className="text-accent-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                  Tên sản phẩm <span className="text-accent-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                  Danh mục <span className="text-accent-600">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input"
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
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Hãng sản xuất</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tỷ lệ</label>
                <input
                  type="text"
                  value={formData.scale}
                  onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Series</label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Giá bán &amp; Kho hàng</h2>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                  Giá bán (VNĐ) <span className="text-accent-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseInt(e.target.value) || 0 })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Giá vốn (VNĐ)</label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tiền cọc 10%</label>
                <input
                  type="text"
                  value={depositAmount.toLocaleString("vi-VN") + " VNĐ"}
                  disabled
                  className="input bg-ink-50 text-ink-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Ngưỡng cảnh báo</label>
                <input
                  type="number"
                  value={formData.minStockAlert}
                  onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 2 })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Trạng thái</label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="input"
                >
                  <option value="IN_STOCK">Có sẵn</option>
                  <option value="PRE_ORDER">Pre-order</option>
                </select>
              </div>
            </div>

            {formData.productType === "PRE_ORDER" && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                    Ngày phát hành dự kiến
                  </label>
                  <input
                    type="date"
                    value={formData.expectedReleaseDate}
                    onChange={(e) => setFormData({ ...formData, expectedReleaseDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                    Giới hạn số suất đặt trước
                  </label>
                  <input
                    type="number"
                    value={formData.preOrderLimit}
                    onChange={(e) => setFormData({ ...formData, preOrderLimit: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Ảnh sản phẩm</h2>
          </div>
          <div className="space-y-4 p-5">
            {formData.imageUrl ? (
              <div className="relative h-48 w-48">
                <img
                  src={formData.imageUrl}
                  alt="Product"
                  className="h-full w-full rounded-lg border border-ink-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-white transition-colors hover:bg-accent-600"
                  aria-label="Xóa ảnh sản phẩm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-300 transition-colors hover:border-ink-400 hover:bg-ink-50">
                <Upload className="mb-3 h-9 w-9 text-ink-400" strokeWidth={1.5} />
                <p className="text-sm text-ink-500">
                  <span className="font-bold text-ink-900">Nhấn để tải lên</span> hoặc kéo thả
                </p>
                <p className="mt-1 text-xs text-ink-400">PNG, JPG, WebP (Tối đa 5MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
            {uploading && <p className="text-sm text-ink-500">Đang xử lý ảnh...</p>}
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">
              Mô tả sản phẩm <span className="text-accent-600">*</span>
            </h2>
          </div>
          <div className="p-5">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={8}
              required
            />
          </div>
        </div>

        {/* Status */}
        <div className="card p-5">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-ink-300 text-accent-600 focus:ring-2 focus:ring-accent-500/30"
            />
            <span className="text-sm font-bold text-ink-700">Hiển thị sản phẩm trên website</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || uploading || !formData.imageUrl}
            className="btn-primary"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
