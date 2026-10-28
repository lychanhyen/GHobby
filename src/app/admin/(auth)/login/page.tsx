"use client";

import { useEffect, useState } from "react";
import { Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.success && data.data?.user?.role === "ADMIN") {
            window.location.replace("/admin");
            return;
          }
        }
      } catch (error) {
        console.error("Check session error:", error);
      }
      if (!cancelled) {
        setChecking(false);
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        if (data.data?.user?.role === "ADMIN") {
          window.location.replace("/admin");
          return;
        } else {
          setError("Tài khoản này không có quyền truy cập trang quản trị");
          setLoading(false);
          return;
        }
      } else {
        setError(data.message || "Đăng nhập thất bại");
        setLoading(false);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng nhập");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="text-sm text-ink-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-950 text-sm font-bold text-white">
            GH
          </span>
          <p className="eyebrow mt-4">Quản trị</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950">GHobby Admin</h1>
          <p className="mt-1 text-sm text-ink-500">Đăng nhập vào khu vực quản trị</p>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input pl-10"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-ink-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] uppercase tracking-wide text-ink-400">
          GHobby · Quản trị nội bộ
        </p>
      </div>
    </div>
  );
}
