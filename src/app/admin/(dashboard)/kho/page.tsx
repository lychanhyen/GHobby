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
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

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
        setNotice({ type: "success", text: "Nhập kho thành công" });
        setShowImportModal(false);
        setImportData({ quantity: 0, note: "", costPrice: 0 });
        fetchInventory();
      } else {
        setNotice({ type: "error", text: data.message || "Không thể cập nhật kho" });
      }
    } catch (error) {
      setNotice({ type: "error", text: "Có lỗi xảy ra" });
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
        setNotice({ type: "success", text: "Điều chỉnh kho thành công" });
        setShowAdjustModal(false);
        setAdjustData({ newStock: 0, note: "" });
        fetchInventory();
      } else {
        setNotice({ type: "error", text: data.message || "Không thể cập nhật kho" });
      }
    } catch (error) {
      setNotice({ type: "error", text: "Có lỗi xảy ra" });
    } finally {
      setProcessing(false);
    }
  };

  const openImportModal = (product: any) => {
    setSelectedProduct(product);
    setImportData({ quantity: 0, note: "", costPrice: product.costPrice || 0 });
    setShowImportModal(true);
  };

  const parseBulkData = (rawText?: string) => {
    const source = typeof rawText === "string" ? rawText : pasteText;
    const lines = source.split(/\r?\n/).filter(l => l.trim());
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
      setNotice({ type: "error", text: "Không có dòng hợp lệ để nhập" });
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
        setNotice({ type: "error", text: data.message || "Không thể cập nhật kho" });
        setShowBulkImportModal(false);
        setBulkItems([]);
        setPasteText("");
        fetchInventory();
      } else {
        setNotice({ type: "error", text: data.message || "Không thể cập nhật kho" });
      }
    } catch (error) {
      setNotice({ type: "error", text: "Có lỗi xảy ra" });
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
      parseBulkData(text);
    } catch (error) {
      setNotice({ type: "error", text: "Không thể đọc file CSV" });
    }
  };

  const openAdjustModal = (product: any) => {
    setSelectedProduct(product);
    setAdjustData({ newStock: product.stockQuantity, note: "" });
    setShowAdjustModal(true);
  };

  const getStockStatus = (product: any) => {
    if (product.productType === "PRE_ORDER") {
      return (
        <span className="inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          Pre-order
        </span>
      );
    }
    if (product.stockQuantity === 0) {
      return (
        <span className="inline-flex items-center rounded-sm border border-accent-200 bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700">
          Hết hàng
        </span>
      );
    }
    if (product.stockQuantity <= 5) {
      return (
        <span className="inline-flex items-center rounded-sm border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-[11px] font-bold text-yellow-700">
          Sắp hết
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
        Còn hàng
      </span>
    );
  };

  const validBulkCount = bulkItems.filter((item) => item.status === "valid").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Quản lý Kho
          </h1>
          <p className="mt-1 text-sm text-ink-500">Theo dõi tồn kho và lịch sử biến động</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/kho/lich-su" className="btn-outline">
            <History className="h-4 w-4" />
            Lịch sử biến động
          </Link>
          <button
            onClick={() => { setShowBulkImportModal(true); setBulkItems([]); setPasteText(""); setBulkTab("paste"); }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Nhập hàng loạt
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-accent-200 bg-accent-50 text-accent-700"
          }`}
        >
          <span className="leading-relaxed">{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Đóng thông báo"
            className="-mr-1 -mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-current/70 transition-colors hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="">Tất cả</option>
            <option value="in">Còn hàng (&gt; 5)</option>
            <option value="low">Sắp hết (1-5)</option>
            <option value="out">Hết hàng (0)</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
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
      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-ink-300" strokeWidth={1.5} />
            <p className="text-sm font-bold text-ink-900">Không có sản phẩm phù hợp</p>
            <p className="mt-1 text-sm text-ink-500">Thử thay đổi bộ lọc tồn kho hoặc danh mục.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Tồn kho</th>
                  <th className="px-4 py-3 text-left">Pre-order</th>
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
                        <p className="text-sm font-bold text-ink-900">{product.name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[13px] text-ink-600">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-lg font-bold text-ink-950">{product.stockQuantity}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">{product.preOrderCount || 0}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">{getStockStatus(product)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openImportModal(product)}
                          className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1.5 text-[12px] font-bold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
                          disabled={product.productType === "PRE_ORDER"}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Nhập</span>
                        </button>
                        <button
                          onClick={() => openAdjustModal(product)}
                          className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1.5 text-[12px] font-bold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Điều chỉnh</span>
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

      {/* Import Modal */}
      {showImportModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lift">
            <div className="border-b border-ink-200 px-5 py-4">
              <h2 className="text-sm font-bold text-ink-950">Nhập kho</h2>
              <p className="mt-0.5 text-[12px] text-ink-500">{selectedProduct.name}</p>
            </div>
            <form onSubmit={handleImport}>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                    Số lượng nhập <span className="text-accent-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={importData.quantity}
                    onChange={(e) => setImportData({ ...importData, quantity: parseInt(e.target.value) || 0 })}
                    className="input"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Giá vốn (VNĐ)</label>
                  <input
                    type="number"
                    value={importData.costPrice}
                    onChange={(e) => setImportData({ ...importData, costPrice: parseInt(e.target.value) || 0 })}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Ghi chú</label>
                  <textarea
                    value={importData.note}
                    onChange={(e) => setImportData({ ...importData, note: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="VD: Nhập từ nhà phân phối..."
                  />
                </div>
              </div>
              <div className="flex gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn-outline flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary flex-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lift">
            <div className="border-b border-ink-200 px-5 py-4">
              <h2 className="text-sm font-bold text-ink-950">Điều chỉnh kho</h2>
              <p className="mt-0.5 text-[12px] text-ink-500">{selectedProduct.name}</p>
              <p className="mt-1 text-[12px] text-ink-400">Tồn kho hiện tại: {selectedProduct.stockQuantity}</p>
            </div>
            <form onSubmit={handleAdjust}>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                    Tồn kho mới <span className="text-accent-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={adjustData.newStock}
                    onChange={(e) => setAdjustData({ ...adjustData, newStock: parseInt(e.target.value) || 0 })}
                    className="input"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                    Lý do điều chỉnh <span className="text-accent-600">*</span>
                  </label>
                  <textarea
                    value={adjustData.note}
                    onChange={(e) => setAdjustData({ ...adjustData, note: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="VD: Kiểm kê thực tế, hủy hàng lỗi..."
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="btn-outline flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-dark flex-1"
                >
                  {processing ? "Đang xử lý..." : "Điều chỉnh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lift">
            <div className="flex items-start justify-between gap-3 border-b border-ink-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-ink-950">Nhập hàng loạt</h2>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  Mỗi dòng gồm: SKU | Số lượng | Giá vốn | Ghi chú
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1">
                <button
                  type="button"
                  onClick={() => setBulkTab("paste")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-[12px] font-bold transition-colors ${
                    bulkTab === "paste" ? "bg-white text-ink-900 shadow-card" : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Dán dữ liệu
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTab("csv")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-[12px] font-bold transition-colors ${
                    bulkTab === "csv" ? "bg-white text-ink-900 shadow-card" : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Tải file CSV
                </button>
              </div>

              {bulkTab === "paste" ? (
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Dữ liệu nhập kho</label>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="input font-mono text-[13px]"
                    rows={6}
                    placeholder={"RG-001 | 10 | 450000 | Nhập đợt 1\nRG-002 | 5 | 620000 | Nhập đợt 1"}
                  />
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-300 transition-colors hover:border-ink-400 hover:bg-ink-50">
                  <Upload className="mb-2 h-7 w-7 text-ink-400" strokeWidth={1.5} />
                  <p className="text-sm text-ink-500">
                    <span className="font-bold text-ink-900">Chọn file CSV</span> để tải dữ liệu
                  </p>
                  <p className="mt-1 text-xs text-ink-400">Định dạng: SKU, Số lượng, Giá vốn, Ghi chú</p>
                  <input type="file" className="hidden" accept=".csv,text/csv" onChange={handleCsvFile} />
                </label>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" onClick={() => parseBulkData()} className="btn-dark">
                  Phân tích dữ liệu
                </button>
                <p className="text-[12px] text-ink-500">
                  {validBulkCount}/{bulkItems.length} dòng hợp lệ
                </p>
              </div>

              {bulkItems.length > 0 && (
                <div className="overflow-hidden rounded-md border border-ink-200">
                  <div className="max-h-56 overflow-auto">
                    <table className="w-full min-w-[520px]">
                      <thead className="sticky top-0 border-b border-ink-200 bg-ink-50 text-[10px] font-bold uppercase tracking-wide text-ink-500">
                        <tr>
                          <th className="px-3 py-2 text-left">SKU</th>
                          <th className="px-3 py-2 text-right">Số lượng</th>
                          <th className="px-3 py-2 text-right">Giá vốn</th>
                          <th className="px-3 py-2 text-left">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {bulkItems.map((item, index) => (
                          <tr key={`${item.sku}-${index}`}>
                            <td className="px-3 py-2 font-mono text-[12px] text-ink-700">{item.sku || "-"}</td>
                            <td className="px-3 py-2 text-right text-[12px] text-ink-700">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-[12px] text-ink-600">{item.costPrice}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold ${
                                  item.status === "valid"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : item.status === "notfound"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-accent-200 bg-accent-50 text-accent-700"
                                }`}
                              >
                                {item.status === "valid" ? item.productName || "Hợp lệ" : item.message}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bulkItems.length === 0 && pasteText.trim() && (
                <p className="flex items-center gap-2 text-[12px] text-ink-500">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  Nhấn &quot;Phân tích dữ liệu&quot; để kiểm tra các dòng trước khi nhập kho.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                className="btn-outline"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={bulkProcessing || validBulkCount === 0}
                className="btn-primary"
              >
                {bulkProcessing ? "Đang xử lý..." : `Nhập kho (${validBulkCount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
