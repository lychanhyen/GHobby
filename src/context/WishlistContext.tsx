"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types/product";

const STORAGE_KEY = "ghobby_wishlist";

interface WishlistContextType {
  items: Product[];
  isHydrated: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item): item is Product =>
                Boolean(item && typeof item === "object" && typeof item.id === "string")
            )
          );
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const isFavorite = (productId: string) => items.some((item) => item.id === productId);

  const toggleFavorite = (product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [product, ...prev];
    });
  };

  const removeFavorite = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isHydrated,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
