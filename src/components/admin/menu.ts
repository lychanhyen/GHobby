import {
  BarChart3,
  FolderTree,
  History,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";

export interface AdminMenuItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

export interface AdminMenuGroup {
  label: string;
  items: AdminMenuItem[];
}

export const adminMenu: AdminMenuGroup[] = [
  {
    label: "Tổng quan",
    items: [{ href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Bán hàng",
    items: [
      { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/nguoi-dung", label: "Khách hàng", icon: Users },
    ],
  },
  {
    label: "Hàng hóa",
    items: [
      { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
      { href: "/admin/danh-muc", label: "Danh mục", icon: FolderTree },
      { href: "/admin/kho", label: "Tồn kho", icon: Warehouse },
      { href: "/admin/nhat-ky-kho", label: "Nhật ký kho", icon: History },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      { href: "/admin/thong-ke", label: "Thống kê", icon: BarChart3 },
      { href: "/admin/bao-cao/loi-nhuan", label: "Lợi nhuận", icon: TrendingUp },
    ],
  },
  {
    label: "Hệ thống",
    items: [{ href: "/admin/cau-hinh", label: "Cấu hình", icon: Settings }],
  },
];

export function isMenuItemActive(pathname: string, item: AdminMenuItem): boolean {
  if (item.exact) return pathname === item.href;
  if (item.href === "/admin/bao-cao/loi-nhuan") {
    return pathname.startsWith("/admin/bao-cao/loi-nhuan");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function findAdminPageTitle(pathname: string): string {
  const all = adminMenu.flatMap((group) => group.items);
  const matches = all
    .filter((item) => isMenuItemActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.label || "Quản trị";
}
