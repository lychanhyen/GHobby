"use client";

import Link from "next/link";
import {
  LogOut,
  Menu,
  PackageSearch,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
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
  const expressRadiusKm = Number(shopSettings.expressRadiusKm) || 3;
  const outerCityShippingFee = Number(shopSettings.outerCityShippingFee) || 20000;
  const brandTagline = shopSettings.brandTagline || "Gunpla & Figure";

  const configuredCategoryIds: string[] = Array.isArray(shopSettings.headerCategoryIds)
    ? shopSettings.headerCategoryIds
    : [];
  const orderedCategories =
    configuredCategoryIds.length > 0
      ? configuredCategoryIds
          .map((categoryId) => categories.find((cat: any) => cat.id === categoryId))
          .filter(Boolean)
      : categories;
  const headerCategoryLimit = Math.max(1, Number(shopSettings.headerCategoryLimit) || 6);
  const headerCategories = orderedCategories.slice(0, headerCategoryLimit);

  const { getTotalItems } = useCart();
  const cartItemsCount = getTotalItems();
  const [mobileOpen, setMobileOpen] = useState(false);
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/";
  };

  const closeMenus = () => {
    setMobileOpen(false);
  };

  const displayName = user?.fullName || user?.username || "Tài khoản";

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      {/* Announcement */}
      <div className="bg-ink-950 text-white">
        <div className="container-page flex h-8 items-center justify-between gap-4 text-[11px] tracking-wide">
          <p className="truncate text-ink-200">
            Miễn phí giao hỏa tốc trong bán kính {expressRadiusKm}km
            <span className="mx-2 text-ink-600">/</span>
            <span className="hidden sm:inline">
              Đồng giá {outerCityShippingFee.toLocaleString("vi-VN")}đ toàn quốc
            </span>
          </p>
          <p className="hidden shrink-0 items-center gap-1.5 text-ink-300 sm:flex">
            Hotline/Zalo
            <span className="font-bold text-white">{shopSettings.shopHotline}</span>
          </p>
        </div>
      </div>

      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 lg:hidden"
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-ink-950 text-sm font-bold tracking-tight text-white transition-colors group-hover:bg-accent-600">
                GH
              </span>
              <span className="leading-none">
                <span className="block text-[19px] font-bold tracking-tight text-ink-950">
                  GHOBBY<span className="text-accent-600">.VN</span>
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-ink-400">
                  {brandTagline}
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-0.5 lg:flex">
            <Link
              href="/"
              prefetch={true}
              className="rounded px-3 py-2 text-[13px] font-bold text-ink-800 transition-colors hover:bg-ink-100"
            >
              Trang chủ
            </Link>
            {headerCategories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                prefetch={true}
                className="rounded px-3 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950"
              >
                {(cat.name || "").split("(")[0].trim()}
              </Link>
            ))}
            <Link
              href="/tra-cuu-don-hang"
              prefetch={true}
              className="rounded px-3 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950"
            >
              Tra cứu đơn
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/tra-cuu-don-hang"
              className="hidden h-10 w-10 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950 md:inline-flex"
              aria-label="Tra cứu đơn hàng"
              title="Tra cứu đơn hàng"
            >
              <PackageSearch className="h-[21px] w-[21px]" />
            </Link>

            <Link
              href="/gio-hang"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950"
              aria-label={`Giỏ hàng${cartItemsCount > 0 ? ` (${cartItemsCount} sản phẩm)` : ""}`}
            >
              <ShoppingCart className="h-[21px] w-[21px]" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}
            </Link>

            {!loading && (
              <div className="relative">
                {user ? (
                  <Link
                    href="/profile"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-ink-200 px-2.5 text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 sm:px-3"
                  >
                    <UserRound className="h-[18px] w-[18px]" />
                    <span className="hidden max-w-[110px] truncate text-xs font-bold sm:block">
                      {displayName}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center rounded-md bg-ink-950 px-4 text-xs font-bold text-white transition-colors hover:bg-ink-800"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white lg:hidden">
          <nav aria-label="Điều hướng di động" className="container-page py-3">
            <div className="grid grid-cols-2 gap-1">
              <Link
                href="/"
                onClick={closeMenus}
                className="rounded px-3 py-2.5 text-sm font-bold text-ink-900 transition-colors hover:bg-ink-50"
              >
                Trang chủ
              </Link>
              <Link
                href="/tra-cuu-don-hang"
                onClick={closeMenus}
                className="rounded px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                Tra cứu đơn
              </Link>
              {headerCategories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  onClick={closeMenus}
                  className="rounded px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
                >
                  {(cat.name || "").split("(")[0].trim()}
                </Link>
              ))}
            </div>

            {user && (
              <div className="mt-3 border-t border-ink-100 pt-3">
                <Link
                  href="/profile"
                  onClick={closeMenus}
                  className="flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
                >
                  <UserRound className="h-4 w-4 text-ink-400" />
                  Trang cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-left text-sm font-medium text-accent-700 transition-colors hover:bg-accent-50"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
