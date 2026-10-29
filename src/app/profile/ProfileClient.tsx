"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
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




interface ProfileClientProps {
  initialProfile: {
    fullName: string;
    phone: string;
    address: string;
    email: string;
  };
}

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [address, setAddress] = useState(initialProfile.address);
  const [email, setEmail] = useState(initialProfile.email);
  const [saving, setSaving] = useState(false);

  const { items: favorites, isHydrated: wishlistHydrated, clearWishlist } = useWishlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && !phone.trim()) {
      toast.error("Vui lòng nhập tên hoặc số điện thoại");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Cập nhật thành công");
        // Giữ dữ liệu mới trong state (không reload)
        setFullName(fullName);
        setPhone(phone);
        setAddress(address);
      } else {
        toast.error(json.message || "Có lỗi không cập nhật được");
      }
    } catch (e: any) {
      toast.error("Kết nối mạng - vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="container-page py-8">
      <Toaster position="top-right" />
      <div className="mb-7 border-b border-ink-200 pb-5">
        <p className="eyebrow">Tài khoản</p>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          Trang cá nhân
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Quản lý thông tin tài khoản và đơn hàng của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <div className="lg:self-start">
          <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
            <div className="border-b border-ink-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-ink-50">
                  <User className="h-5 w-5 text-ink-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-950">Khách hàng</p>
                  <p className="mt-0.5 text-xs text-ink-500">Thành viên</p>
                </div>
              </div>
            </div>
            <nav className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const itemClassName = `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                  activeTab === item.id
                    ? "bg-ink-100 font-bold text-ink-950"
                    : "font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-950"
                }`;

                if (item.href) {
                  return (
                    <Link key={item.id} href={item.href} className={itemClassName}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={itemClassName}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="my-2 border-t border-ink-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-accent-700 transition-colors duration-200 hover:bg-accent-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
          {activeTab === "info" && (
            <div>
              <h2 className="text-base font-bold text-ink-950">Thông tin cá nhân</h2>
              <p className="mt-1 text-xs text-ink-500">
                Thông tin dùng để liên hệ và giao hàng.
              </p>

              <div className="mt-5 space-y-4">
                <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="profileFullName" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                      Họ và tên
                    </label>
                    <input
                      id="profileFullName"
                      type="text"
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label htmlFor="profilePhone" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        id="profilePhone"
                        type="tel"
                        className="input pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="profileEmail" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                    Email{" "}
                    <span className="font-normal text-ink-400">(không thể thay đổi)</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      id="profileEmail"
                      type="email"
                      className="input cursor-not-allowed bg-ink-50 pl-10 text-ink-700"
                      value={email}
                      readOnly
                      aria-readonly="true"
                      title="Email không thể thay đổi"
                      placeholder="Email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profileAddress" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                    Địa chỉ giao hàng
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
                    <textarea
                      id="profileAddress"
                      className="input pl-10"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ giao hàng"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-dark px-5" disabled={saving}>
                  {saving ? "Cập nhật..." : "Cập nhật thông tin"}
                </button>
              </form>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink-950">Sản phẩm yêu thích</h2>
                  <p className="mt-1 text-xs text-ink-500">
                    {favorites.length > 0
                      ? `${favorites.length} sản phẩm đã lưu`
                      : "Danh sách sản phẩm bạn quan tâm"}
                  </p>
                </div>
                {favorites.length > 0 && (
                  <button
                    type="button"
                    onClick={clearWishlist}
                    className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-ink-500 transition-colors duration-200 hover:text-accent-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                )}
              </div>

              {!wishlistHydrated ? (
                <div className="py-12 text-center text-sm text-ink-500">Đang tải...</div>
              ) : favorites.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-ink-200 px-5 py-12 text-center">
                  <Heart className="mx-auto h-8 w-8 text-ink-300" />
                  <p className="mt-3 text-sm font-bold text-ink-800">Chưa có sản phẩm yêu thích</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
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
  );
}
