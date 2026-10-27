"use client";

import { Heart } from "lucide-react";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export default function WishlistButton({ product, className = "" }: WishlistButtonProps) {
  const { isFavorite, toggleFavorite } = useWishlist();
  const favorite = isFavorite(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(product)}
      aria-pressed={favorite}
      className={`inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl border font-bold text-sm transition-colors ${
        favorite
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:text-red-600"
      } ${className}`}
    >
      <Heart className={`w-5 h-5 ${favorite ? "fill-red-600" : ""}`} />
      <span>{favorite ? "Đã yêu thích" : "Thêm vào yêu thích"}</span>
    </button>
  );
}
