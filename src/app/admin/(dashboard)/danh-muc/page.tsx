"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  if (loading) {
    return <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Danh mục</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Quản Lý Danh Mục
          </h1>
          <p className="mt-1 text-sm text-ink-500">Quản lý các danh mục sản phẩm</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {categories.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-bold text-ink-900">Chưa có danh mục nào</p>
            <p className="mt-1 text-sm text-ink-500">Thêm danh mục để phân loại sản phẩm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Tên danh mục</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Mô tả</th>
                  <th className="px-4 py-3 text-left">Số sản phẩm</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-ink-50/70">
                    <td className="px-4 py-3.5 text-sm font-bold text-ink-900">{category.name}</td>
                    <td className="px-4 py-3.5 font-mono text-[13px] text-ink-600">{category.slug}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{category.description || "-"}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{category._count?.products || 0}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          title="Chỉnh sửa danh mục"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          title="Xóa danh mục"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-accent-50 hover:text-accent-700"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lift">
            <div className="border-b border-ink-200 px-5 py-4">
              <h2 className="text-sm font-bold text-ink-950">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                    Tên danh mục <span className="text-accent-600">*</span>
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
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
