"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatCurrencyVND } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const isOutOfStock = product.productType === "IN_STOCK" && product.stockQuantity <= 0;
  const isPreOrder = product.productType === "PRE_ORDER";
  const isLowStock =
    product.productType === "IN_STOCK" &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.minStockAlert;
  const favorite = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const result = addItem(product, 1);
    setFeedback(
      result.ok
        ? { type: "success", text: "Đã thêm vào giỏ" }
        : { type: "error", text: result.message || "Không thể thêm vào giỏ" }
    );
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-ink-200 bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <Link
        href={`/san-pham/${product.slug}`}
        prefetch={true}
        className="relative block aspect-square w-full overflow-hidden bg-ink-50"
      >
        <Image
          src={product.imageUrl}
          alt={`Mô hình ${product.name} - ${product.scale} chính hãng ${product.brand}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {isPreOrder && (
            <span className="rounded-sm bg-amber-100/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 backdrop-blur-sm">
              Pre-order
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-sm bg-ink-950/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Hết hàng
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="rounded-sm bg-white/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-700 backdrop-blur-sm">
              Còn {product.stockQuantity}
            </span>
          )}
        </div>

        <span className="absolute bottom-2 left-2 rounded-sm bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-600 backdrop-blur-sm">
          {product.scale}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-pressed={favorite}
        aria-label={favorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        title={favorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
          favorite
            ? "border-accent-200 bg-white text-accent-600"
            : "border-transparent bg-white/90 text-ink-500 opacity-100 hover:border-ink-200 hover:text-accent-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-accent-600" : ""}`} />
      </button>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">
          <span className="truncate">{product.brand}</span>
          <span className="shrink-0 font-mono text-[10px] font-normal normal-case tracking-normal text-ink-300">
            {product.sku}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-snug text-ink-950 sm:text-sm">
          <Link
            href={`/san-pham/${product.slug}`}
            prefetch={true}
            className="transition-colors hover:text-accent-700"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-1 text-[11px] text-ink-500 sm:text-xs">
          {product.series}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-none text-ink-950">
              {formatCurrencyVND(product.sellingPrice)}
            </p>
            {isPreOrder ? (
              <p className="mt-1.5 text-[10px] font-medium text-amber-700">
                Cọc 10% · {formatCurrencyVND(Math.round(product.sellingPrice * 0.1))}
              </p>
            ) : isOutOfStock ? (
              <p className="mt-1.5 text-[10px] font-medium text-ink-400">Tạm hết hàng</p>
            ) : (
              <p className="mt-1.5 text-[10px] font-medium text-ink-400">
                Còn {product.stockQuantity} hộp
              </p>
            )}
          </div>

          {!isOutOfStock ? (
            <button
              onClick={handleAddToCart}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-ink-300 px-2.5 text-[11px] font-bold text-ink-800 transition-colors duration-200 hover:border-ink-950 hover:bg-ink-950 hover:text-white"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{isPreOrder ? "Đặt" : "Thêm"}</span>
            </button>
          ) : (
            <Link
              href={`/san-pham/${product.slug}`}
              prefetch={true}
              className="inline-flex h-8 shrink-0 items-center rounded-md border border-ink-200 px-2.5 text-[11px] font-bold text-ink-400 transition-colors hover:border-ink-300 hover:text-ink-600"
            >
              Xem
            </Link>
          )}
        </div>

        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-2 text-[10px] font-medium ${
              feedback.type === "success" ? "text-emerald-700" : "text-accent-700"
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </article>
  );
}
