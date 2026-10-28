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
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border px-6 text-sm font-bold transition-colors duration-200 ${
        favorite
          ? "border-accent-200 bg-accent-50 text-accent-700 hover:bg-accent-100"
          : "border-ink-300 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-950"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${favorite ? "fill-accent-600 text-accent-600" : ""}`} />
      <span>{favorite ? "Đã yêu thích" : "Thêm vào yêu thích"}</span>
    </button>
  );
}
