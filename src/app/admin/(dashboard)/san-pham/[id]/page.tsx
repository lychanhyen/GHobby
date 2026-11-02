"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductImageUploader from "@/components/admin/ProductImageUploader";
import { formatCurrencyVND } from "@/lib/utils";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentCostPrice, setCurrentCostPrice] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormState>({
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
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        const product = data.data;
        setFormData({
          sku: product.sku || "",
          name: product.name || "",
          categoryId: product.categoryId || "",
          brand: product.brand || "",
          scale: product.scale || "",
          series: product.series || "",
          sellingPrice: product.sellingPrice || 0,
          stockQuantity: product.stockQuantity || 0,
          productType: product.productType || "IN_STOCK",
          expectedReleaseDate: product.expectedReleaseDate
            ? new Date(product.expectedReleaseDate).toISOString().split("T")[0]
            : "",
          preOrderLimit: product.preOrderLimit || 0,
          description: product.description || "",
          isActive: product.isActive ?? true,
        });
        setCurrentCostPrice(product.costPrice || 0);

        // Ảnh: sản phẩm cũ chỉ có imageUrl -> coi imageUrl là ảnh chính.
        const productImages: string[] = Array.isArray(product.images)
          ? product.images.filter((url: unknown) => typeof url === "string" && url)
          : [];
        const initialImages =
          productImages.length > 0
            ? productImages
            : product.imageUrl
            ? [product.imageUrl]
            : [];
        setImages(initialImages);
      } else {
        alert(data?.message || "Không tải được thông tin sản phẩm");
        router.push("/admin/san-pham");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setFormError("Không tải được thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (images.length === 0) {
      setFormError("Sản phẩm cần có ít nhất một ảnh");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: images[0],
          images,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        alert("Cập nhật sản phẩm thành công");
        router.push("/admin/san-pham");
      } else {
        setFormError(data?.message || "Cập nhật sản phẩm thất bại, vui lòng thử lại");
      }
    } catch {
      setFormError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
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

            <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
              <p className="text-xs font-bold text-ink-800">
                Giá vốn trung bình: {formatCurrencyVND(currentCostPrice)} · chỉ đọc
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                Giá vốn được tính bình quân gia quyền từ toàn bộ lịch sử nhập kho (giá
                nhập × số lượng của từng lô), nên mỗi lần nhập hàng bạn chỉ cần điền giá
                nhập ở trang <span className="font-bold text-ink-700">Kho hàng</span>.
              </p>
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
            <h2 className="text-sm font-bold text-ink-900">Ảnh sản phẩm</h2>
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
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
