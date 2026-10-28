"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, User as UserIcon, Lock, Unlock } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  phone: string | null;
  city: string | null;
  role: "ADMIN" | "STAFF" | "USER";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setError("");
      } else {
        setError(data.message || "Không tải được danh sách người dùng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (id: string, payload: { role?: string; isActive?: boolean }) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      alert("Có lỗi xảy ra");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 rounded-sm border border-accent-200 bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700">
          <ShieldCheck className="h-3 w-3" />
          <span>ADMIN</span>
        </span>
      );
    }
    if (role === "STAFF") {
      return (
        <span className="inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          STAFF
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-sm border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-bold text-ink-600">
        <UserIcon className="h-3 w-3" />
        <span>USER</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Người dùng</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            Quản Lý Người Dùng
          </h1>
          <p className="mt-1 text-sm text-ink-500">Danh sách tài khoản quản trị và khách hàng</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-2 text-[12px] font-bold text-ink-600">
          <Users className="h-4 w-4" />
          <span>{users.length} tài khoản</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Chưa có người dùng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px]">
              <thead className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">Tên đăng nhập</th>
                  <th className="px-4 py-3 text-left">Liên hệ</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-ink-50/70">
                    <td className="px-4 py-3.5 text-sm font-bold text-ink-900">{user.fullName}</td>
                    <td className="px-4 py-3.5 font-mono text-[13px] text-ink-600">{user.username}</td>
                    <td className="px-4 py-3.5 text-sm text-ink-600">
                      <p>{user.phone || "Chưa có SĐT"}</p>
                      {user.city && <p className="text-[12px] text-ink-400">{user.city}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">{getRoleBadge(user.role)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {user.isActive ? (
                        <span className="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-sm border border-ink-200 bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-600">
                          Đã khoá
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[12px] font-bold text-ink-700 transition-colors focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/10"
                        >
                          <option value="USER">USER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button
                          onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                            user.isActive
                              ? "text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={user.isActive ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                        >
                          {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
