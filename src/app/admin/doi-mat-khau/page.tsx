"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        setError(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đổi mật khẩu thành công</h2>
          <p className="text-slate-600">Đang chuyển hướng đến trang quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Đổi mật khẩu bắt buộc</h1>
          <p className="text-slate-400">Vui lòng đổi mật khẩu cho lần đăng nhập đầu tiên</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ít nhất 8 ký tự"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
