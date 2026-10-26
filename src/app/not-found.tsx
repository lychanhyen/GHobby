import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-3xl mx-auto mb-6">
        404
      </div>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
        Không Tìm Thấy Trang Yêu Cầu
      </h1>

      <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto mb-8">
        Mẫu mô hình hoặc đường dẫn bạn đang tìm kiếm có thể đã đổi tên hoặc tạm thời không khả dụng. Vui lòng khám phá các danh mục Gundam khác tại GHobby Đà Nẵng.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors shadow-sm"
        >
          Về Trang Chủ
        </Link>
        <Link
          href="/danh-muc/high-grade-hg"
          className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          Xem High Grade (HG)
        </Link>
        <Link
          href="/danh-muc/real-grade-rg"
          className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          Xem Real Grade (RG)
        </Link>
      </div>
    </div>
  );
}
