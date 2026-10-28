"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, User } from "lucide-react";

export default function CustomerLoginPage() {
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
          if (!cancelled && data.success && data.data?.user) {
            const target = data.data.user.role === "ADMIN" ? "/admin" : "/";
            window.location.replace(target);
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
        }
        window.location.replace("/");
        return;
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
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12 text-sm text-ink-500">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-10 sm:py-14">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded bg-ink-950 text-sm font-bold tracking-tight text-white">
            GH
          </span>
          <p className="mt-4 eyebrow">Tài khoản khách hàng</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink-950">GHobby</h1>
          <p className="mt-1 text-sm text-ink-500">Đăng nhập tài khoản khách hàng</p>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="loginUsername" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="loginUsername"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input pl-10"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="loginPassword" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="loginPassword"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary h-11 w-full px-5">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="border-t border-ink-100 pt-4 text-center text-sm text-ink-500">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-bold text-accent-700 underline-offset-4 transition-colors duration-200 hover:text-accent-800 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
