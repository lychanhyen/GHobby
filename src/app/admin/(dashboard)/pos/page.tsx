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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Bán hàng</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            <Store className="h-5 w-5 text-ink-400" strokeWidth={1.8} />
            Bán Tại Cửa Hàng (POS)
          </h1>
          <p className="mt-1 text-sm text-ink-500">Xuất kho và thu tiền trực tiếp tại cửa hàng</p>
        </div>
      </div>

      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Danh sách sản phẩm */}
        <div className="card p-4 lg:col-span-3">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc SKU..."
              className="input pl-10"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-ink-500">Đang tải sản phẩm...</div>
          ) : (
            <div className="grid max-h-[520px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="flex items-center gap-3 rounded-lg border border-ink-200 p-3 text-left transition-colors hover:border-ink-400 hover:bg-ink-50"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-12 w-12 shrink-0 rounded-md border border-ink-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{product.name}</p>
                    <p className="truncate font-mono text-[11px] text-ink-500">{product.sku}</p>
                    <p className="mt-1 text-[12px] font-bold text-accent-700">
                      {formatCurrencyVND(product.sellingPrice)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-sm border px-2 py-0.5 text-[11px] font-bold ${
                      product.stockQuantity > 0
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-accent-200 bg-accent-50 text-accent-700"
                    }`}
                  >
                    {product.stockQuantity}
                  </span>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="col-span-2 py-10 text-center text-sm text-ink-500">
                  Không tìm thấy sản phẩm phù hợp
                </p>
              )}
            </div>
          )}
        </div>

        {/* Giỏ hàng POS */}
        <div className="card flex flex-col p-4 lg:col-span-2">
          <h2 className="mb-3 flex items-center justify-between border-b border-ink-200 pb-3 text-sm font-bold text-ink-900">
            Đơn hàng
            <span className="text-[12px] font-medium text-ink-500">{totalItems} sản phẩm</span>
          </h2>

          <div className="max-h-[360px] flex-1 space-y-3 overflow-y-auto">
            {lines.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-500">
                Chọn sản phẩm bên trái để thêm vào đơn
              </p>
            ) : (
              lines.map((line) => (
                <div key={line.product.id} className="flex items-center gap-2 border-b border-ink-100 pb-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{line.product.name}</p>
                    <p className="text-[12px] text-ink-500">
                      {formatCurrencyVND(line.product.sellingPrice)} × {line.quantity}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => changeQuantity(line.product.id, -1)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-ink-900">{line.quantity}</span>
                    <button
                      onClick={() => changeQuantity(line.product.id, 1)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition-colors hover:bg-ink-50"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeLine(line.product.id)}
                      className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-accent-50 hover:text-accent-700"
                      aria-label="Xóa sản phẩm khỏi đơn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-4 border-t border-ink-200 pt-4">
            <div>
              <p className="mb-2 text-[12px] font-bold text-ink-700">Phương thức thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[12px] font-bold transition-colors ${
                    paymentMethod === "CASH"
                      ? "border-ink-900 bg-ink-950 text-white"
                      : "border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50"
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[12px] font-bold transition-colors ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-ink-900 bg-ink-950 text-white"
                      : "border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50"
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Chuyển khoản (QR)</span>
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-ink-100 pt-3">
              <span className="text-[12px] font-bold uppercase tracking-wide text-ink-500">
                Tổng tiền
              </span>
              <span className="text-xl font-bold text-ink-950">{formatCurrencyVND(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting || lines.length === 0}
              className="btn-primary w-full py-3"
            >
              {submitting ? "Đang xuất kho..." : "XUẤT KHO & THANH TOÁN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
