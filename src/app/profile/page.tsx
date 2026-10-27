"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");
  const { items: favorites, isHydrated: wishlistHydrated, clearWishlist } = useWishlist();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const navItems: { id: string; label: string; icon: LucideIcon; href?: string }[] = [
    { id: "info", label: "Thông tin cá nhân", icon: User },
    { id: "orders", label: "Đơn hàng của tôi", icon: Package, href: "/profile/don-hang" },
    { id: "favorites", label: "Sản phẩm yêu thích", icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Trang cá nhân</h1>
        <p className="text-slate-600 mt-2">Quản lý thông tin tài khoản và đơn hàng của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Khách hàng</p>
                  <p className="text-sm text-slate-500">Thành viên</p>
                </div>
              </div>
            </div>
            <nav className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const itemClassName = `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-red-50 text-red-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`;

                if (item.href) {
                  return (
                    <Link key={item.id} href={item.href} className={itemClassName}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={itemClassName}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-slate-700 hover:bg-slate-50 mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {activeTab === "info" && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin cá nhân</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Địa chỉ giao hàng
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <textarea
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={3}
                        placeholder="Nhập địa chỉ giao hàng"
                      />
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Cập nhật thông tin
                  </button>
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Sản phẩm yêu thích</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {favorites.length > 0
                        ? `${favorites.length} sản phẩm đã lưu`
                        : "Danh sách sản phẩm bạn quan tâm"}
                    </p>
                  </div>
                  {favorites.length > 0 && (
                    <button
                      onClick={clearWishlist}
                      className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa tất cả</span>
                    </button>
                  )}
                </div>

                {!wishlistHydrated ? (
                  <div className="text-center py-12 text-slate-500">Đang tải...</div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>Chưa có sản phẩm yêu thích</p>
                    <p className="text-sm mt-1">
                      Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {favorites.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
