import Link from "next/link";

interface FooterProps {
  settings?: any;
  categories?: any[];
}

export default function Footer({ settings, categories = [] }: FooterProps) {
  const shopSettings = settings || {
    shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
    shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
    shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0905.123.456",
    outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Shop Intro */}
          <div className="md:col-span-1">
            <span className="text-xl font-extrabold tracking-tight text-white block mb-3">
              GHOBBY<span className="text-red-500">.VN</span>
            </span>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Cửa hàng chuyên phân phối mô hình Gunpla Bandai chính hãng (HG, RG, MG, PG, SD), Figure anime cao cấp và phụ kiện mô hình uy tín, giao hàng toàn quốc.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>📍 Địa chỉ: {shopSettings.shopAddress}</p>
              <p>📞 Hotline/Zalo: {shopSettings.shopHotline}</p>
              <p>⏰ Mở cửa: 09:00 - 21:00 hàng ngày</p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Dòng Sản Phẩm
            </h3>
            <ul className="space-y-2 text-sm">
              {(categories || []).slice(0, 12).map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={`/danh-muc/${cat.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {(categories || []).length === 0 && (
                <li className="text-slate-600 text-xs">Đang cập nhật...</li>
              )}
            </ul>
          </div>

          {/* Col 3: Policy */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Chính Sách & Vận Chuyển
            </h3>
            <ul className="space-y-2 text-sm">
              <li>🚚 Giao hàng: Ngoại thành {(shopSettings.outerCityShippingFee || 20000).toLocaleString("vi-VN")}đ | Nội thành thỏa thuận Zalo</li>
              <li>🛡️ Cam kết: 100% hàng chính hãng Bandai Spirits (Nhật Bản)</li>
              <li>📦 Đóng gói: Thùng carton 5 lớp, bọc bóng khí chống móp hộp kit</li>
              <li>🔒 An toàn: Đặt cọc 10% chuyển khoản bảo vệ quyền lợi hai bên</li>
            </ul>
          </div>

          {/* Col 4: Payment Methods (NO ACCOUNT NUMBER HERE!) */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Hình Thức Thanh Toán
            </h3>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
              <div className="flex items-center space-x-2 text-slate-200 font-medium">
                <span className="text-base">💳</span>
                <span>Quét mã VietQR (Hỗ trợ 40+ app ngân hàng)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200 font-medium">
                <span className="text-base">📦</span>
                <span>Thanh toán COD số tiền còn lại khi nhận hàng</span>
              </div>
              <p className="text-amber-400 text-[11px] pt-1 border-t border-slate-800">
                * Mã VietQR và thông tin tài khoản sẽ hiển thị ngay sau khi quý khách hoàn tất đặt đơn trên web.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {shopSettings.shopName}. Tất cả các quyền được bảo lưu.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <span>Chuẩn SEO Google</span>
            <span>•</span>
            <span>Quản Lý Kho Chống Âm</span>
            <span>•</span>
            <span>Thanh Toán VietQR Napas247</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
