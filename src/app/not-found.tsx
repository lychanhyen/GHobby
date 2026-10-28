import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page py-20 lg:py-28">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500">
          <PackageSearch className="h-6 w-6" strokeWidth={1.6} />
        </span>

        <p className="eyebrow mt-6">Lỗi 404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
          Không tìm thấy trang yêu cầu
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
          Mẫu mô hình hoặc đường dẫn bạn đang tìm kiếm có thể đã đổi tên hoặc tạm thời không
          khả dụng. Vui lòng khám phá các danh mục Gundam khác tại GHobby Đà Nẵng.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-dark px-5">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
          <Link href="/danh-muc/high-grade-hg" className="btn-outline px-5">
            Xem High Grade (HG)
          </Link>
          <Link href="/danh-muc/real-grade-rg" className="btn-outline px-5">
            Xem Real Grade (RG)
          </Link>
        </div>
      </div>
    </div>
  );
}
