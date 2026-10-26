import Link from "next/link";
import { SAMPLE_CATEGORIES } from "@/data/sample-products";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-xs py-1.5 px-4 text-center font-medium">
        <span>🔥 Ưu đãi Gundam & Figure: Ship cố định 20K liên tỉnh | Nội thành Đà Nẵng hỗ trợ giao hỏa tốc Zalo</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-xl tracking-wider text-white shadow-lg group-hover:bg-red-500 transition-colors">
                GH
              </span>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                  GHOBBY<span className="text-red-500">.VN</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
                  Gunpla & Figure Đà Nẵng
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Trang Chủ
            </Link>
            {SAMPLE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {cat.name.split("(")[0].trim()}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/gio-hang"
              className="relative inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Giỏ hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="sr-only">Giỏ hàng</span>
            </Link>

            <Link
              href="/admin"
              className="text-xs px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
            >
              Quản Trị
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Category Scroller */}
      <div className="md:hidden border-t border-slate-800 px-4 py-2 overflow-x-auto scrollbar-none flex space-x-2 text-xs">
        <Link
          href="/"
          className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
        >
          Tất cả
        </Link>
        {SAMPLE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/danh-muc/${cat.slug}`}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
          >
            {cat.name.split("(")[0].trim()}
          </Link>
        ))}
      </div>
    </header>
  );
}
