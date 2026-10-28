"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { adminMenu, isMenuItemActive } from "./menu";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-ink-950 text-white lg:flex">
      <div className="flex h-16 items-center border-b border-ink-800 px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold text-ink-950">
            GH
          </span>
          <span>
            <span className="block text-[15px] font-bold leading-none tracking-tight">GHobby</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-ink-500">
              Quản trị
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Điều hướng quản trị">
        {adminMenu.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-600">
              {group.label}
            </p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isMenuItemActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-[background,color] duration-200 ${
                        isActive
                          ? "bg-white/10 font-bold text-white shadow-sm"
                          : "font-medium text-ink-400 hover:bg-white/5 hover:text-white hover:shadow-lift"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-accent-500" />
                      )}
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          isActive ? "text-accent-400" : "text-ink-500 group-hover:text-ink-300"
                        }`}
                        strokeWidth={1.8}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <Link
          href="/"
          prefetch={true}
          className="flex items-center justify-between rounded-md px-3 py-2.5 text-[12px] font-medium text-ink-400 transition-[background,color] duration-200 hover:bg-white/5 hover:text-white hover:shadow-lift"
        >
          Xem cửa hàng
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
