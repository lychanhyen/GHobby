"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { adminMenu, findAdminPageTitle, isMenuItemActive } from "./menu";

interface AdminHeaderProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pageTitle = findAdminPageTitle(pathname);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-ink-100 lg:hidden"
              aria-label="Mở menu quản trị"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400 sm:block">
                Quản trị
              </p>
              <h1 className="truncate text-[15px] font-bold text-ink-950">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={true}
              className="hidden h-9 items-center gap-2 rounded-md border border-ink-200 px-3 text-[12px] font-bold text-ink-600 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-900 sm:inline-flex"
            >
              Xem cửa hàng
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="inline-flex h-10 items-center gap-2 rounded-md px-1.5 transition-colors hover:bg-ink-50 sm:px-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-700">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-[12px] font-bold leading-tight text-ink-900">
                    {user.fullName || user.username}
                  </span>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400">
                    {user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
                  </span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-ink-400 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-lift animate-fade-up"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-ink-900">
                      {user.fullName || user.username}
                    </p>
                    <p className="truncate text-xs text-ink-500">{user.username}</p>
                  </div>
                  <div className="border-t border-ink-100" />
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  >
                    <Home className="h-4 w-4 text-ink-400" />
                    Về trang chủ
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  >
                    <UserRound className="h-4 w-4 text-ink-400" />
                    Trang cá nhân
                  </Link>
                  <Link
                    href="/profile/don-hang"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  >
                    <ShoppingBag className="h-4 w-4 text-ink-400" />
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    href="/admin/cau-hinh"
                    prefetch={true}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  >
                    <Settings className="h-4 w-4 text-ink-400" />
                    Cấu hình cửa hàng
                  </Link>
                  <div className="border-t border-ink-100" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-accent-700 transition-colors hover:bg-accent-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-ink-950 text-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-ink-800 px-4">
              <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <span className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-ink-950">
                  GH
                </span>
                <span className="text-[15px] font-bold tracking-tight">GHobby</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Đóng menu quản trị"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Điều hướng quản trị di động">
              {adminMenu.map((group) => (
                <div key={group.label}>
                  <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-600">
                    {group.label}
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isMenuItemActive(pathname, item);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                              isActive
                                ? "bg-white/10 font-bold text-white"
                                : "font-medium text-ink-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-ink-800 p-3">
              <Link
                href="/"
                prefetch={true}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-[12px] font-medium text-ink-400 transition-colors hover:bg-white/5 hover:text-white hover:shadow-lift"
              >
                Xem cửa hàng
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
