"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductImageUploader from "@/components/admin/ProductImageUploader";

interface ProductFormState {
  sku: string;
  name: string;
  categoryId: string;
  brand: string;
  scale: string;
  series: string;
  sellingPrice: number;
  stockQuantity: number;
  productType: string;
  expectedReleaseDate: string;
  preOrderLimit: number;
  description: string;
  isActive: boolean;
}

const INITIAL_FORM: ProductFormState = {
  sku: "",
  name: "",
  categoryId: "",
  brand: "",
  scale: "",
  series: "",
  sellingPrice: 0,
  stockQuantity: 0,
  productType: "IN_STOCK",
  expectedReleaseDate: "",
  preOrderLimit: 0,
  description: "",
  isActive: true,
};

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (images.length === 0) {
      setFormError("Vui lòng tải lên ít nhất một ảnh sản phẩm");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: images[0],
          images,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        alert("Tạo sản phẩm thành công");
        router.push("/admin/san-pham");
      } else {
        setFormError(data?.message || "Tạo sản phẩm thất bại, vui lòng thử lại");
      }
    } catch {
      setFormError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const depositAmount = Math.round((formData.sellingPrice * 10) / 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="eyebrow">Sản phẩm</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          Thêm sản phẩm mới
        </h1>
        <p className="mt-1 text-sm text-ink-500">Tạo sản phẩm mới trong hệ thống</p>
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
                  placeholder="Bandai Spirits"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tỷ lệ</label>
                <input
                  type="text"
                  value={formData.scale}
                  onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                  className="input"
                  placeholder="1/144, 1/100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Series</label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  className="input"
                  placeholder="Universal Century"
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
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Tiền cọc 10%</label>
                <input
                  type="text"
                  value={depositAmount.toLocaleString("vi-VN") + " VNĐ"}
                  disabled
                  className="input bg-ink-50 text-ink-500"
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
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="input"
                />
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

        {/* Images */}
        <div className="card">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">
              Ảnh sản phẩm <span className="text-accent-600">*</span>
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Ảnh đầu tiên là ảnh chính. Bấm vào ảnh con để đặt làm ảnh chính.
            </p>
          </div>
          <div className="p-5">
            <ProductImageUploader images={images} onChange={setImages} max={10} />
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
              placeholder="Mô tả chi tiết sản phẩm..."
              required
            />
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-800"
          >
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => router.back()} className="btn-outline">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
