"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types/product";

const GUEST_KEY = "ghobby_wishlist_guest";

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
  const [userId, setUserId] = useState<string | null>(null);

  const [userChecked, setUserChecked] = useState(false);

  // Load current user on mount to decide DB vs LocalStorage
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // API trả về { success, data: { user } }, không phải { user }
          const id = data?.data?.user?.id;
          if (mounted && id) setUserId(id);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setUserChecked(true);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, []);

  // Load wishlist after auth status is known.
  // Chỉ chạy khi userId/userChecked thay đổi, không phụ thuộc `items`
  // để tránh vòng lặp setItems -> render -> setItems vô hạn.
  useEffect(() => {
    if (!userChecked) return;
    let cancelled = false;

    const loadWishlist = async () => {
      if (userId) {
        try {
          // Gộp wishlist khách vào DB trước khi tải danh sách từ DB.
          const savedGuest = localStorage.getItem(GUEST_KEY);
          if (savedGuest) {
            const guestItems = JSON.parse(savedGuest);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const existingRes = await fetch("/api/wishlist");
              const existingJson = await existingRes.json();
              const existingIds = new Set(
                existingJson.success && Array.isArray(existingJson.data)
                  ? existingJson.data.map((i: any) => i.productId)
                  : []
              );
              for (const item of guestItems) {
                const productId = item?.id || item?.productId;
                if (productId && !existingIds.has(productId)) {
                  await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId }),
                  });
                }
              }
            }
            localStorage.removeItem(GUEST_KEY);
          }

          const res = await fetch("/api/wishlist");
          const json = await res.json();
          if (!cancelled) {
            setItems(
              json.success && Array.isArray(json.data)
                ? json.data.map((i: any) => i.product).filter(Boolean)
                : []
            );
          }
        } catch (e) {
          console.error("Wishlist DB fetch error:", e);
          if (!cancelled) setItems([]);
        } finally {
          if (!cancelled) setIsHydrated(true);
        }
        return;
      }

      // Khách chưa đăng nhập: đọc từ localStorage
      try {
        const saved = localStorage.getItem(GUEST_KEY);
        if (!cancelled) {
          if (saved) {
            const parsed = JSON.parse(saved);
            setItems(
              Array.isArray(parsed)
                ? parsed.filter(
                    (item: any) =>
                      Boolean(item && typeof item === "object" && typeof item.id === "string")
                  )
                : []
            );
          } else {
            setItems([]);
          }
        }
      } catch (error) {
        console.error("Error loading guest wishlist:", error);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    };

    loadWishlist();
    return () => { cancelled = true; };
  }, [userChecked, userId]);

  // Persist guest wishlist; wishlist của user đã nằm trong DB.
  useEffect(() => {
    if (!isHydrated || userId) return;
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(items));
    } catch {}
  }, [items, userId, isHydrated]);

  const isFavorite = (productId: string) => items.some((item) => item.id === productId);

  const toggleFavorite = async (product: Product) => {
    if (!userId) {
      const { toast } = await import("react-hot-toast");
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
      window.location.href = "/login";
      return;
    }
    // DB mode only
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        const json = await res.json();
        if (json.success) {
          if (json.action === "added") {
            setItems((prev) => (prev.find((i) => i.id === product.id) ? prev : [product, ...prev]));
          } else {
            setItems((prev) => prev.filter((i) => i.id !== product.id));
          }
        }
      } catch (e) {
        console.error("Wishlist toggle DB error:", e);
      }
  };

  const removeFavorite = async (productId: string) => {
    if (!userId) {
      const { toast } = await import("react-hot-toast");
      toast.error("Vui lòng đăng nhập để quản lý sản phẩm yêu thích!");
      window.location.href = "/login";
      return;
    }
    try {
      await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setItems((prev) => prev.filter((item) => item.id !== productId));
      } catch (e) {
        console.error("Wishlist remove DB error:", e);
      }
  };

  const clearWishlist = async () => {
    if (userId) {
      try {
        // Delete all DB entries for this user
        const current = [...items];
        for (const item of current) {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: item.id }),
          });
        }
        setItems([]);
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
      try { localStorage.removeItem(GUEST_KEY); } catch {}
    }
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
