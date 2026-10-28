"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, MapPin, Phone, User, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
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
      } catch (err) {
        console.error("Check session error:", err);
      }
      if (!cancelled) setChecking(false);
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          phone: formData.phone,
          city: formData.city,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.replace("/");
        return;
      }

      setError(data.message || "Đăng ký thất bại");
      setLoading(false);
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng ký");
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
      <div className="w-full max-w-[460px]">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded bg-ink-950 text-sm font-bold tracking-tight text-white">
            GH
          </span>
          <p className="eyebrow mt-4">Tài khoản khách hàng</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink-950">GHobby</h1>
          <p className="mt-1 text-sm text-ink-500">Tạo tài khoản khách hàng</p>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="registerFullName" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Họ và tên
              </label>
              <div className="relative">
                <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="registerFullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input pl-10"
                  placeholder="Nhập họ và tên"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="registerPhone" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                  Số điện thoại{" "}
                  <span className="font-normal text-ink-400">(không bắt buộc)</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="registerPhone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input pl-10"
                    placeholder="VD: 0905 123 456"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="registerCity" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                  Tỉnh/Thành phố{" "}
                  <span className="font-normal text-ink-400">(không bắt buộc)</span>
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="registerCity"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input pl-10"
                    placeholder="VD: Đà Nẵng"
                    autoComplete="address-level2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="registerUsername" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="registerUsername"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input pl-10"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  minLength={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="registerPassword" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="registerPassword"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input pl-10"
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="registerConfirmPassword" className="mb-1.5 block text-[13px] font-bold text-ink-800">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="registerConfirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input pl-10"
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary h-11 w-full px-5">
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <p className="border-t border-ink-100 pt-4 text-center text-sm text-ink-500">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-bold text-accent-700 underline-offset-4 transition-colors duration-200 hover:text-accent-800 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
