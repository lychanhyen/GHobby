"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Home, ShoppingBag, Settings } from "lucide-react";

interface AdminHeaderProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Bảng điều khiển</h2>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-900">{user.fullName || user.username}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Về trang chủ</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Trang cá nhân</span>
              </Link>
              <Link
                href="/profile/don-hang"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Đơn hàng của tôi</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Quản trị</span>
              </Link>
              <div className="border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
