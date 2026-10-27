"use client";

import Link from "next/link";
import { ShoppingCart, User, LogOut, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface HeaderProps {
  settings?: any;
  categories?: any[];
}

export default function Header({ settings, categories = [] }: HeaderProps) {
  const shopSettings = settings || {
    shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
    outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
  };
  const { getTotalItems } = useCart();
  const cartItemsCount = getTotalItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user) {
            setUser(data.data.user);
          }
        }
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-xs py-1.5 px-4 text-center font-medium">
        <span>🔥 Ưu đãi Gunpla & Figure: Đồng giá ship ngoại thành {(shopSettings.outerCityShippingFee || 20000).toLocaleString("vi-VN")}đ | Nội thành hỗ trợ giao hỏa tốc Zalo</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-xl tracking-wider text-white shadow-lg group-hover:bg-red-500 transition-colors">
                GH
              </span>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                  GHOBBY<span className="text-red-500">.VN</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
                  Gunpla & Figure Shop
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Trang Chủ
            </Link>
            {(categories || []).slice(0, 8).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {(cat.name || "").split("(")[0].trim()}
              </Link>
            ))}
            <Link
              href="/tra-cuu-don-hang"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Tra cứu đơn hàng
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/gio-hang"
              className="relative inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Giỏ hàng</span>
            </Link>

            {!loading && (
              <>
                {user?.role === "ADMIN" ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded border border-red-600 text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Vào trang Quản trị</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                ) : user?.role === "USER" ? (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>{user.fullName || user.username}</span>
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                          onClick={() => setMenuOpen(false)}
                        >
                          Trang cá nhân
                        </Link>
                        <Link
                          href="/profile/don-hang"
                          className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                          onClick={() => setMenuOpen(false)}
                        >
                          Đơn hàng của tôi
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Category Scroller */}
      <div className="md:hidden border-t border-slate-800 px-4 py-2 overflow-x-auto scrollbar-none flex space-x-2 text-xs">
        <Link
          href="/"
          className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
        >
          Tất cả
        </Link>
        {(categories || []).slice(0, 10).map((cat: any) => (
          <Link
            key={cat.id}
            href={`/danh-muc/${cat.slug}`}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
          >
            {(cat.name || "").split("(")[0].trim()}
          </Link>
        ))}
        <Link
          href="/tra-cuu-don-hang"
          className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
        >
          Tra cứu đơn hàng
        </Link>
      </div>
    </header>
  );
}
