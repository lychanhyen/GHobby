"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, AlertTriangle, Plus, History, Edit, FileText, Upload, X } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [importData, setImportData] = useState({ quantity: 0, note: "", costPrice: 0 });
  const [adjustData, setAdjustData] = useState({ newStock: 0, note: "" });
  const [processing, setProcessing] = useState(false);

  // Bulk import state
  const [bulkTab, setBulkTab] = useState<"paste" | "csv">("paste");
  const [pasteText, setPasteText] = useState("");
  const [bulkItems, setBulkItems] = useState<any[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [filter, categoryId]);

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

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter && { filter }),
        ...(categoryId && { categoryId }),
      });
      const res = await fetch(`/api/admin/inventory?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch("/api/admin/inventory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: importData.quantity,
          note: importData.note,
          costPrice: importData.costPrice || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Nhập kho thành công");
        setShowImportModal(false);
        setImportData({ quantity: 0, note: "", costPrice: 0 });
        fetchInventory();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          newStock: adjustData.newStock,
          note: adjustData.note,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Điều chỉnh kho thành công");
        setShowAdjustModal(false);
        setAdjustData({ newStock: 0, note: "" });
        fetchInventory();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setProcessing(false);
    }
  };

  const openImportModal = (product: any) => {
    setSelectedProduct(product);
    setImportData({ quantity: 0, note: "", costPrice: product.costPrice || 0 });
    setShowImportModal(true);
  };

  const parseBulkData = () => {
    const lines = pasteText.split(/\r?\n/).filter(l => l.trim());
    const items: any[] = [];
    for (const line of lines) {
      // Try different separators
      let parts = line.split("|").map(p => p.trim());
      if (parts.length < 3) {
        parts = line.split(",").map(p => p.trim());
      }
      if (parts.length < 3) continue;
      const [sku, qtyStr, priceStr, noteStr] = parts;
      const quantity = parseInt(qtyStr);
      const costPrice = parseInt(priceStr);
      if (!sku || isNaN(quantity) || quantity <= 0 || isNaN(costPrice) || costPrice < 0) {
        items.push({ sku, quantity, costPrice, note: noteStr || "", status: "invalid", message: "Dữ liệu không hợp lệ" });
        continue;
      }
      const product = products.find(p => p.sku?.toLowerCase() === sku.toLowerCase());
      if (!product) {
        items.push({ sku, quantity, costPrice, note: noteStr || "", status: "notfound", message: "Không tìm thấy SKU" });
        continue;
      }
      items.push({ sku, quantity, costPrice, note: noteStr || "", status: "valid", productName: product.name, productId: product.id });
    }
    setBulkItems(items);
  };

  const handleBulkImport = async () => {
    const validItems = bulkItems.filter(i => i.status === "valid");
    if (validItems.length === 0) {
      alert("Không có dòng hợp lệ để nhập");
      return;
    }
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/inventory/import-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: validItems.map(i => ({ sku: i.sku, quantity: i.quantity, costPrice: i.costPrice, note: i.note })) }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowBulkImportModal(false);
        setBulkItems([]);
        setPasteText("");
        fetchInventory();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setPasteText(text);
      // Auto parse after setting
      setTimeout(parseBulkData, 100);
    } catch (error) {
      alert("Không thể đọc file CSV");
    }
  };

  const openAdjustModal = (product: any) => {
    setSelectedProduct(product);
    setAdjustData({ newStock: product.stockQuantity, note: "" });
    setShowAdjustModal(true);
  };

  const getStockStatus = (product: any) => {
    if (product.productType === "PRE_ORDER") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pre-order</span>;
    }
    if (product.stockQuantity === 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Hết hàng</span>;
    }
    if (product.stockQuantity <= 5) {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Sắp hết</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Còn hàng</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Qu?n l� Kho</h1>
          <p className="text-slate-600 mt-1">Theo dõi tồn kho và lịch sử biến động</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setShowBulkImportModal(true); setBulkItems([]); setPasteText(""); }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập hàng loạt</span>
          </button>
          <Link
            href="/admin/kho/lich-su"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600"
          >
            <History className="w-4 h-4" />
            <span>Lịch sử biến động</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả</option>
            <option value="in">Còn hàng (&gt; 5)</option>
            <option value="low">Sắp hết (1-5)</option>
            <option value="out">Hết hàng (0)</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
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
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tồn kho</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Pre-order</th>
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
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-slate-900">{product.stockQuantity}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{product.preOrderCount || 0}</td>
                    <td className="px-6 py-4">{getStockStatus(product)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openImportModal(product)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        disabled={product.productType === "PRE_ORDER"}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nhập</span>
                      </button>
                      <button
                        onClick={() => openAdjustModal(product)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Điều chỉnh</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Nhập kho</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedProduct.name}</p>
            </div>
            <form onSubmit={handleImport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng nhập *</label>
                <input
                  type="number"
                  value={importData.quantity}
                  onChange={(e) => setImportData({ ...importData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú</label>
                <textarea
                  value={importData.note}
                  onChange={(e) => setImportData({ ...importData, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="VD: Nhập từ nhà phân phối..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50"
                >
                  {processing ? "Đang xử lý..." : "Nhập kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Điều chỉnh kho</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedProduct.name}</p>
              <p className="text-xs text-slate-500 mt-1">Tồn kho hiện tại: {selectedProduct.stockQuantity}</p>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tồn kho mới *</label>
                <input
                  type="number"
                  value={adjustData.newStock}
                  onChange={(e) => setAdjustData({ ...adjustData, newStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lý do điều chỉnh *</label>
                <textarea
                  value={adjustData.note}
                  onChange={(e) => setAdjustData({ ...adjustData, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="VD: Kiểm kê thực tế, hủy hàng lỗi..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50"
                >
                  {processing ? "Đang xử lý..." : "Điều chỉnh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

