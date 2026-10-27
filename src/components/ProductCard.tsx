"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatCurrencyVND } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const isOutOfStock = product.productType === "IN_STOCK" && product.stockQuantity <= 0;
  const isPreOrder = product.productType === "PRE_ORDER";
  const isLowStock = product.productType === "IN_STOCK" && product.stockQuantity > 0 && product.stockQuantity <= product.minStockAlert;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1);
    alert("Đã thêm sản phẩm vào giỏ hàng");
  };

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Image Container with Fixed Aspect Ratio to prevent CLS */}
      <Link
        href={`/san-pham/${product.slug}`}
        className="relative block w-full aspect-square bg-slate-100 overflow-hidden"
      >
        <Image
          src={product.imageUrl}
          alt={`Mô hình ${product.name} - ${product.scale} chính hãng ${product.brand}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPreOrder && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white shadow-sm">
              PRE-ORDER (CỌC 10%)
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-white shadow-sm">
              HẾT HÀNG
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white shadow-sm">
              CHỈ CÒN {product.stockQuantity} HỘP
            </span>
          )}
        </div>

        {/* Scale Badge */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
          {product.scale}
        </span>
      </Link>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-slate-600">{product.brand}</span>
            <span className="text-[11px] font-mono text-slate-400">{product.sku}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
            <Link href={`/san-pham/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            Series: {product.series}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-red-600 block">
              {formatCurrencyVND(product.sellingPrice)}
            </span>
            {isPreOrder && product.expectedReleaseDate && (
              <span className="text-[10px] text-amber-700 font-medium block">
                Phát hành: {typeof product.expectedReleaseDate === "string" ? product.expectedReleaseDate : new Date(product.expectedReleaseDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}
              </span>
            )}
          </div>

          {!isOutOfStock ? (
            <button
              onClick={handleAddToCart}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center space-x-1"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>{isPreOrder ? "Đặt trước" : "Thêm"}</span>
            </button>
          ) : (
            <Link
              href={`/san-pham/${product.slug}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-400 text-white cursor-not-allowed"
            >
              Hết hàng
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
