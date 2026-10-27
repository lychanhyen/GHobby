"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

interface AdminHeaderProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
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

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
