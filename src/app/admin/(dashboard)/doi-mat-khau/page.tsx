"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";

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
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="eyebrow">Tài khoản</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Đổi mật khẩu
          </h1>
          <p className="mt-1 text-sm text-ink-500">Cập nhật mật khẩu đăng nhập quản trị</p>
        </div>

        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" strokeWidth={1.8} />
          </div>
          <h2 className="text-lg font-bold text-ink-950">Đổi mật khẩu thành công</h2>
          <p className="mt-1 text-sm text-ink-500">Đang chuyển hướng đến trang quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="eyebrow">Tài khoản</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          Đổi mật khẩu bắt buộc
        </h1>
        <p className="mt-1 text-sm text-ink-500">Vui lòng đổi mật khẩu cho lần đăng nhập đầu tiên</p>
      </div>

      <div className="card p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="input pl-10"
                placeholder="Ít nhất 8 ký tự"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input pl-10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
