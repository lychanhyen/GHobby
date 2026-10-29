import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

interface FooterProps {
  settings?: any;
  categories?: any[];
}

export default function Footer({ settings, categories = [] }: FooterProps) {
  const shopSettings = settings || {
    shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
    shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
    shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0905.123.456",
    shopEmail: process.env.NEXT_PUBLIC_SHOP_EMAIL || "support@ghobby.vn",
    outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
  };
  const expressRadiusKm = Number(shopSettings.expressRadiusKm) || 3;
  const brandTagline = shopSettings.brandTagline || "Gunpla & Figure";

  return (
    <footer className="mt-20 border-t border-ink-200 bg-ink-950 text-ink-300">
      <div className="container-page py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-white text-sm font-bold tracking-tight text-ink-950">
                GH
              </span>
              <span className="text-[19px] font-bold tracking-tight text-white">
                GHOBBY<span className="text-accent-500">.VN</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              Cửa hàng {brandTagline} chính hãng. Chọn hàng kỹ, đóng gói cẩn thận, giao đúng hẹn.
            </p>

            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                <span>{shopSettings.shopAddress}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-ink-500" />
                <a
                  href={`https://zalo.me/${(shopSettings.shopHotline || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {shopSettings.shopHotline} (Zalo)
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-ink-500" />
                <a href={`mailto:${shopSettings.shopEmail}`} className="transition-colors hover:text-white">
                  {shopSettings.shopEmail}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-ink-500" />
                <span>09:00 – 21:00, hàng ngày</span>
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
              Dòng sản phẩm
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.slice(0, 7).map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={`/danh-muc/${cat.slug}`}
                    prefetch={true}
                    className="text-ink-300 transition-colors hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-xs text-ink-500">Đang cập nhật</li>
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
              Hỗ trợ
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/tra-cuu-don-hang"
                  prefetch={true}
                  className="text-ink-300 transition-colors hover:text-white"
                >
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/don-hang"
                  prefetch={true}
                  className="text-ink-300 transition-colors hover:text-white"
                >
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/gio-hang"
                  prefetch={true}
                  className="text-ink-300 transition-colors hover:text-white"
                >
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <a
                  href={`https://zalo.me/${(shopSettings.shopHotline || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-300 transition-colors hover:text-white"
                >
                  Tư vấn qua Zalo
                </a>
              </li>
            </ul>
          </div>

          {/* Shipping & payment */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
              Giao hàng &amp; thanh toán
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
              <li className="flex justify-between gap-4">
                <span>Toàn quốc</span>
                <span className="font-bold text-white">
                  {(shopSettings.outerCityShippingFee || 20000).toLocaleString("vi-VN")}đ
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Hỏa tốc &lt; {expressRadiusKm}km</span>
                <span className="font-bold text-white">Miễn phí</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Nhận tại cửa hàng</span>
                <span className="font-bold text-white">Miễn phí</span>
              </li>
              <li className="flex justify-between gap-4 border-t border-ink-800 pt-2.5">
                <span>Đặt cọc</span>
                <span className="font-bold text-white">10%</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded border border-ink-700 px-2.5 py-1 text-[11px] font-bold text-ink-300">
                VietQR
              </span>
              <span className="rounded border border-ink-700 px-2.5 py-1 text-[11px] font-bold text-ink-300">
                COD
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              Hỏa tốc trên {expressRadiusKm}km vui lòng nhắn Zalo để shop báo phí trước khi giao.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {shopSettings.shopName}. Tất cả các quyền được bảo lưu.
          </p>
          <p>Hàng chính hãng · Đổi trả trong 7 ngày · Bảo vệ người mua</p>
        </div>
      </div>
    </footer>
  );
}
