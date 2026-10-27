"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/product";
import { getProductCartLimit } from "@/lib/cart";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AddItemResult {
  ok: boolean;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (product: Product, quantity?: number) => AddItemResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDepositAmount: () => number;
  hasMixedCart: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("ghobby_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Chỉ ghi lại localStorage sau khi đã đọc xong giỏ hàng ban đầu,
  // tránh việc ghi đè giỏ hàng đã lưu bằng mảng rỗng lúc mới mount.
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("ghobby_cart", JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = (product: Product, quantity: number = 1): AddItemResult => {
    const normalizedQuantity = Math.floor(quantity);

    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
      return { ok: false, message: "Số lượng không hợp lệ" };
    }

    const hasDifferentType = items.some(
      (item) => item.product.productType !== product.productType
    );
    if (hasDifferentType) {
      return {
        ok: false,
        message:
          "Giỏ hàng đang có sản phẩm khác loại (có sẵn / pre-order). Vui lòng tách thành 2 đơn riêng biệt.",
      };
    }

    const maxQuantity = getProductCartLimit(product);
    const existingItem = items.find((item) => item.product.id === product.id);
    const currentQuantity = existingItem?.quantity ?? 0;

    if (maxQuantity <= 0) {
      return {
        ok: false,
        message:
          product.productType === "IN_STOCK"
            ? "Sản phẩm này hiện đã hết hàng"
            : "Sản phẩm này đã hết suất pre-order",
      };
    }

    if (currentQuantity + normalizedQuantity > maxQuantity) {
      const limitMessage =
        product.productType === "IN_STOCK"
          ? `chỉ còn tối đa ${maxQuantity} hộp có thể đặt`
          : `chỉ còn tối đa ${maxQuantity} suất pre-order`;

      return {
        ok: false,
        message: `Không thể thêm: ${limitMessage}. Giỏ hàng đang có ${currentQuantity} sản phẩm.`,
      };
    }

    if (existingItem) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + normalizedQuantity }
            : item
        )
      );
    } else {
      setItems((prevItems) => [...prevItems, { product, quantity: normalizedQuantity }]);
    }

    return { ok: true };
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.sellingPrice * item.quantity, 0);
  };

  const getDepositAmount = () => {
    // 10% deposit as per requirements
    return Math.round(getTotalPrice() * 0.1);
  };

  const hasMixedCart = () => {
    if (items.length === 0) return false;
    const types = items.map((item) => item.product.productType);
    const hasInStock = types.includes("IN_STOCK");
    const hasPreOrder = types.includes("PRE_ORDER");
    return hasInStock && hasPreOrder;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getDepositAmount,
        hasMixedCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
