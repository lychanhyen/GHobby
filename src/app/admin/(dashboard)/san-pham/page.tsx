"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filters]);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.status && { status: filters.status }),
      });

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, isActive: !product.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchProducts();
      } else {
        alert(data.message || "Xóa sản phẩm thất bại");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa sản phẩm");
    } finally {
      setDeleting(false);
    }
  };

  const getProductStatusBadge = (product: any) => {
    if (!product.isActive) {
      return (
        <span className="inline-flex items-center rounded-sm border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-bold text-ink-600">
          Ẩn
        </span>
      );
    }
    if (product.productType === "PRE_ORDER") {
      return (
        <span className="inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          Pre-order
        </span>
      );
    }
    if (product.stockQuantity > 0) {
      return (
        <span className="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          Có sẵn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-sm border border-accent-200 bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700">
        Hết hàng
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Sản phẩm</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Quản Lý Sản Phẩm
          </h1>
          <p className="mt-1 text-sm text-ink-500">Quản lý danh sách sản phẩm</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/san-pham/tao-moi" className="btn-primary">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            className="input"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-bold text-ink-900">Chưa có sản phẩm nào</p>
            <p className="mt-1 text-sm text-ink-500">Thêm sản phẩm mới để bắt đầu kinh doanh.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Danh mục</th>
                  <th className="px-4 py-3 text-left">Giá bán</th>
                  <th className="px-4 py-3 text-left">Tồn kho</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-ink-50/70">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 shrink-0 rounded-md border border-ink-100 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink-900">{product.name}</p>
                          <p className="truncate text-[12px] text-ink-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[13px] text-ink-600">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{product.category?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-ink-900">
                      {formatCurrencyVND(product.sellingPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{product.stockQuantity}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">{getProductStatusBadge(product)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/san-pham/${product.id}`}
                          title="Chỉnh sửa sản phẩm"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleProductStatus(product)}
                          title={product.isActive ? "Ẩn sản phẩm" : "Hiển thị sản phẩm"}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                        >
                          {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-accent-50 hover:text-accent-700"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lift">
            <div className="border-b border-ink-200 px-5 py-4">
              <h3 className="text-sm font-bold text-ink-950">Xác nhận xóa sản phẩm</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-ink-600">
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <span className="font-bold text-ink-900">{deleteTarget.name}</span>? Nếu sản phẩm
                chưa có đơn hàng/lịch sử kho, sản phẩm sẽ bị xóa vĩnh viễn. Nếu đã phát sinh dữ
                liệu, sản phẩm chỉ được ẩn khỏi cửa hàng để giữ lịch sử.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn-outline"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="btn-primary"
              >
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
