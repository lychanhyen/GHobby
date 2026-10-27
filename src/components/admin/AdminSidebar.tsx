"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Store,
  ShoppingCart,
  Users,
  BarChart3,
  Warehouse,
  History,
  Settings,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Tổng Quan", icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "Sản Phẩm", icon: Package },
  { href: "/admin/danh-muc", label: "Danh Mục", icon: FolderTree },
  { href: "/admin/pos", label: "Bán Tại Cửa Hàng", icon: Store },
  { href: "/admin/don-hang", label: "Đơn Hàng", icon: ShoppingCart },
  { href: "/admin/nguoi-dung", label: "Người Dùng", icon: Users },
  { href: "/admin/thong-ke", label: "Báo Cáo & Thống Kê", icon: BarChart3 },
  { href: "/admin/kho", label: "Quản Lý Kho", icon: Warehouse },
  { href: "/admin/nhat-ky-kho", label: "Nhật Ký Kho", icon: History },
  { href: "/admin/cai-dat", label: "Cài Đặt", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white hidden lg:block">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="block">
            <h1 className="text-xl font-black">GHobby Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Quản trị hệ thống</p>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">GHobby Admin Panel</p>
        </div>
      </div>
    </aside>
  );
}
