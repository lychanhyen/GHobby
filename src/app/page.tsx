import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/products";

export default async function HomePage() {
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const inStockProducts = allProducts.filter((p) => p.productType === "IN_STOCK");
  const preOrderProducts = allProducts.filter((p) => p.productType === "PRE_ORDER");

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white py-12 md:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-400 border border-red-500/30 mb-4">
              CHÍNH HÃNG BANDAI SPIRITS • ĐÀ NẴNG
            </span>
            {/* EXACTLY ONE H1 ON HOME PAGE */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
              Shop Mô Hình Gunpla & Figure Chính Hãng <span className="text-red-500">GHobby Đà Nẵng</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Thiên đường dành cho builder Gunpla với đầy đủ các cấp độ High Grade, Real Grade, Master Grade, Perfect Grade và Figure chính hãng. Quản lý kho chuẩn xác theo thời gian thực, đặt cọc 10% an tâm nhận hàng.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/danh-muc/real-grade-rg"
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-900/40"
              >
                Khám Phá Real Grade (RG)
              </Link>
              <Link
                href="/danh-muc/master-grade-mg"
                className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm hover:bg-slate-700 hover:text-white transition-colors"
              >
                Xem Dòng Master Grade (MG)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">🇯🇵</span>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase">100% Chính Hãng</h2>
              <p className="text-[11px] text-slate-500">Bandai Spirits & Kotobukiya</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase">Đóng Hộp 5 Lớp</h2>
              <p className="text-[11px] text-slate-500">Chống móp hộp kit tối đa</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">🚚</span>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase">Đồng Giá Ship 20K</h2>
              <p className="text-[11px] text-slate-500">Liên tỉnh | Nội thành Zalo</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">💳</span>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase">Chỉ Cọc 10%</h2>
              <p className="text-[11px] text-slate-500">Quét mã VietQR tiện lợi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phân Loại Theo Dòng Gunpla & Figure
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-md transition-all text-center group block"
            >
              <span className="text-sm font-bold text-slate-800 group-hover:text-red-600 block transition-colors">
                {cat.name.split("(")[0].trim()}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Xem toàn bộ kit →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* In-stock Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Mô Hình Có Sẵn Tại Kho Đà Nẵng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hàng có sẵn đóng gói giao ngay trong ngày. Tồn kho tự động cập nhật chính xác.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {inStockProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 2} />
          ))}
        </div>
      </section>

      {/* Pre-order Section */}
      {preOrderProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
              <span>★ HÀNG ĐẶT TRƯỚC SẮP PHÁT HÀNH</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Pre-Order Mẫu Kit Mới Nhất (Chỉ Cọc 10%)
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mb-6">
              Đặt trước để chắc chắn giữ suất mở bán với mức giá tốt nhất từ hãng Bandai. Khách hàng chỉ cần cọc trước 10% tiền hàng qua mã VietQR, thanh toán phần còn lại khi nhận hàng.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {preOrderProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
