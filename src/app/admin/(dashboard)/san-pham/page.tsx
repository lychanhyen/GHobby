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
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Ẩn</span>;
    }
    if (product.productType === "PRE_ORDER") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pre-order</span>;
    }
    if (product.stockQuantity > 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Có sẵn</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Hết hàng</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Sản Phẩm</h1>
          <p className="text-slate-600 mt-1">Quản lý danh sách sản phẩm</p>
        </div>
        <Link
          href="/admin/san-pham/tao-moi"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Sản phẩm</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">SKU</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Danh mục</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Giá bán</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tồn kho</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Trạng thái</th>
                  <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.sku}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{product.category?.name}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{formatCurrencyVND(product.sellingPrice)}</td>
                    <td className="px-6 py-4 text-slate-600">{product.stockQuantity}</td>
                    <td className="px-6 py-4">{getProductStatusBadge(product)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/san-pham/${product.id}`}
                        className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa sản phẩm</h3>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <span className="font-bold text-slate-900">{deleteTarget.name}</span>? Hành động này
              sẽ ẩn sản phẩm khỏi cửa hàng.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
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
