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
        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
          <ShieldCheck className="w-3 h-3" />
          <span>ADMIN</span>
        </span>
      );
    }
    if (role === "STAFF") {
      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">STAFF</span>;
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
        <UserIcon className="w-3 h-3" />
        <span>USER</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Người Dùng</h1>
          <p className="text-slate-600 mt-1">Danh sách tài khoản quản trị và khách hàng</p>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <Users className="w-5 h-5" />
          <span className="font-bold">{users.length} tài khoản</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Chưa có người dùng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Họ tên</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Tên đăng nhập</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Liên hệ</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Vai trò</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Trạng thái</th>
                  <th className="text-left text-xs font-bold text-slate-600 uppercase px-6 py-3">Ngày tạo</th>
                  <th className="text-right text-xs font-bold text-slate-600 uppercase px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <p>{user.phone || "Chưa có SĐT"}</p>
                      {user.city && <p className="text-xs text-slate-400">{user.city}</p>}
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                          Đã khoá
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="USER">USER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button
                          onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? "text-slate-600 hover:bg-slate-100"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={user.isActive ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                        >
                          {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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
