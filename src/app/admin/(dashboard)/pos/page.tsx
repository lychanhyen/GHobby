"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2, Store, Banknote, QrCode } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

interface PosProduct {
  id: string;
  sku: string;
  name: string;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl: string;
}

interface CartLine {
  product: PosProduct;
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?limit=200&status=active", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      } else {
        setError(data.message || "Không tải được sản phẩm");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products.slice(0, 12);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) || p.sku.toLowerCase().includes(keyword)
      )
      .slice(0, 20);
  }, [products, search]);

  const addProduct = (product: PosProduct) => {
    setError("");
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setError(`Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} trong kho`);
          return prev;
        }
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      if (product.stockQuantity < 1) {
        setError(`Sản phẩm "${product.name}" đã hết hàng`);
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const changeQuantity = (productId: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((line) => {
          if (line.product.id !== productId) return line;
          const next = line.quantity + delta;
          if (next > line.product.stockQuantity) return line;
          return { ...line, quantity: next };
        })
        .filter((line) => line.quantity > 0)
    );
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  };

  const total = lines.reduce((sum, l) => sum + l.product.sellingPrice * l.quantity, 0);
  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

  const handleCheckout = async () => {
    if (lines.length === 0) {
      setError("Chưa chọn sản phẩm nào");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`Xuất kho thành công! Mã đơn: ${data.data.orderCode}`);
        setLines([]);
        setSearch("");
        fetchProducts();
      } else {
        setError(data.message || "Xuất kho thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xuất kho");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
          <Store className="w-6 h-6 text-red-600" />
          <span>Bán Tại Cửa Hàng (POS)</span>
        </h1>
        <p className="text-slate-600 mt-1">Xuất kho và thu tiền trực tiếp tại cửa hàng</p>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc SKU..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">Đang tải sản phẩm...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50/40 text-left transition-colors"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                    <p className="text-xs font-bold text-red-600 mt-1">
                      {formatCurrencyVND(product.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        product.stockQuantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="col-span-2 text-center py-10 text-slate-500">
                  Không tìm thấy sản phẩm phù hợp
                </p>
              )}
            </div>
          )}
        </div>

        {/* Giỏ hàng POS */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Đơn hàng ({totalItems} sản phẩm)
          </h2>

          <div className="flex-1 space-y-3 max-h-[360px] overflow-y-auto">
            {lines.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">
                Chọn sản phẩm bên trái để thêm vào đơn
              </p>
            ) : (
              lines.map((line) => (
                <div key={line.product.id} className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{line.product.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatCurrencyVND(line.product.sellingPrice)} × {line.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => changeQuantity(line.product.id, -1)}
                      className="p-1 rounded border border-slate-300 hover:bg-slate-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">{line.quantity}</span>
                    <button
                      onClick={() => changeQuantity(line.product.id, 1)}
                      className="p-1 rounded border border-slate-300 hover:bg-slate-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeLine(line.product.id)}
                      className="p-1 ml-1 rounded text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">Phương thức thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${
                    paymentMethod === "CASH"
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Chuyển khoản (QR)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Tổng tiền</span>
              <span className="text-xl font-black text-red-600">{formatCurrencyVND(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting || lines.length === 0}
              className="w-full py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Đang xuất kho..." : "XUẤT KHO & THANH TOÁN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
