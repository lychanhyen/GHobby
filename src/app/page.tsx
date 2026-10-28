import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { formatCurrencyVND } from "@/lib/utils";

export default async function HomePage() {
  let settings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = {
      shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
      shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
      shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0905.123.456",
      outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
    };
  }
  let categories: any[] = [];
  let allProducts: any[] = [];
  try {
    [categories, allProducts] = await Promise.all([getCategories(), getProducts()]);
  } catch {
    categories = [];
    allProducts = [];
  }

  const inStockProducts = allProducts.filter((p) => p.productType === "IN_STOCK");
  const preOrderProducts = allProducts.filter((p) => p.productType === "PRE_ORDER");
  const featured = inStockProducts[0] || allProducts[0];
  const secondary = inStockProducts[1] || allProducts[1];
  const zaloHref = `https://zalo.me/${(settings.shopHotline || "").replace(/\D/g, "")}`;

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="border-b border-ink-200 bg-[#edeae3]">
        <div className="container-page grid items-center gap-10 py-10 lg:grid-cols-12 lg:gap-14 lg:py-16">
          <div className="lg:col-span-6">
            <p className="eyebrow">Bandai Spirits · Kotobukiya · Chính hãng</p>
            <h1 className="mt-4 text-[2rem] font-bold leading-[1.08] tracking-tight text-ink-950 sm:text-[2.55rem] lg:text-[3.05rem]">
              Mô hình chính hãng
              <br className="hidden sm:block" /> cho người yêu{" "}
              <span className="text-accent-600">từng chi tiết</span>.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-600 sm:text-[15px]">
              Gunpla Bandai, figure anime và dụng cụ lắp ráp — chọn kỹ từng sản phẩm,
              đóng gói cẩn thận, giao đúng hẹn trên toàn quốc.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="#hang-co-san" className="btn-dark px-5">
                Xem hàng có sẵn
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#pre-order" className="btn-outline px-5">
                Pre-order mới
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
              <span>HG · RG · MG · PG</span>
              <span className="hidden h-3 w-px bg-ink-300 sm:block" />
              <span>Cọc 10%</span>
              <span className="hidden h-3 w-px bg-ink-300 sm:block" />
              <span>Đóng gói 5 lớp</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid h-[300px] grid-cols-5 grid-rows-6 gap-2.5 sm:h-[400px] sm:gap-3 lg:h-[440px]">
              {featured ? (
                <Link
                  href={`/san-pham/${featured.slug}`}
                  className="group relative col-span-3 row-span-6 overflow-hidden rounded-lg border border-ink-200 bg-white"
                >
                  <Image
                    src={featured.imageUrl}
                    alt={featured.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 60vw, 30vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 via-ink-950/35 to-transparent p-4 pt-12">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-200">
                      {featured.brand}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white">
                      {featured.name}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-white">
                      {formatCurrencyVND(featured.sellingPrice)}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="col-span-3 row-span-6 flex items-center justify-center rounded-lg bg-ink-950 text-4xl font-bold tracking-tight text-white">
                  GH
                </div>
              )}

              {secondary ? (
                <Link
                  href={`/san-pham/${secondary.slug}`}
                  className="group relative col-span-2 row-span-3 overflow-hidden rounded-lg border border-ink-200 bg-white"
                >
                  <Image
                    src={secondary.imageUrl}
                    alt={secondary.name}
                    fill
                    sizes="(max-width: 1024px) 40vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
              ) : (
                <div className="col-span-2 row-span-3 rounded-lg bg-ink-200" />
              )}

              <Link
                href="/tra-cuu-don-hang"
                className="col-span-2 row-span-3 flex flex-col justify-between rounded-lg bg-ink-950 p-4 text-white transition-colors hover:bg-ink-900"
              >
                <Zap className="h-5 w-5 text-accent-500" />
                <div>
                  <p className="text-[17px] font-bold leading-tight">Hỏa tốc dưới 3km</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
                    Miễn phí giao nội bộ. Trên 3km nhắn Zalo để báo phí.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service strip */}
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-px bg-ink-200 lg:grid-cols-4">
            {[
              { icon: BadgeCheck, title: "Chính hãng 100%", desc: "Bandai Spirits & Kotobukiya" },
              { icon: PackageCheck, title: "Đóng gói 5 lớp", desc: "Chống móp hộp kit tối đa" },
              {
                icon: Truck,
                title: `Toàn quốc ${(settings.outerCityShippingFee || 20000).toLocaleString("vi-VN")}đ`,
                desc: "Hỏa tốc dưới 3km miễn phí",
              },
              { icon: CreditCard, title: "Cọc 10% VietQR", desc: "Giữ hàng, thanh toán phần còn lại sau" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 bg-white px-4 py-5 sm:px-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-800" strokeWidth={1.6} />
                  <div>
                    <p className="text-[12px] font-bold text-ink-950">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-ink-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page pt-12 sm:pt-14">
          <div className="flex items-end justify-between gap-4 border-b border-ink-200 pb-4">
            <div>
              <p className="eyebrow">Danh mục</p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
                Chọn dòng mô hình
              </h2>
            </div>
            <p className="hidden text-xs text-ink-500 sm:block">{categories.length} dòng sản phẩm</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3.5 transition-colors duration-200 hover:border-ink-900"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900">
                    {cat.name.split("(")[0].trim()}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-400">
                    Xem dòng kit
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-ink-900" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* In-stock products */}
      <section id="hang-co-san" className="container-page scroll-mt-24 pt-12 sm:pt-14">
        <div className="flex items-end justify-between gap-4 border-b border-ink-200 pb-4">
          <div>
            <p className="eyebrow">Có sẵn tại kho</p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
              Giao ngay trong hôm nay
            </h2>
          </div>
          <p className="hidden text-xs text-ink-500 sm:block">{inStockProducts.length} sản phẩm</p>
        </div>

        {inStockProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {inStockProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 2} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-ink-900">Kho đang được cập nhật</p>
            <p className="mt-1 text-sm text-ink-500">
              Xem các mẫu pre-order bên dưới hoặc nhắn Zalo để được tư vấn.
            </p>
          </div>
        )}
      </section>

      {/* Pre-order */}
      {preOrderProducts.length > 0 && (
        <section id="pre-order" className="container-page scroll-mt-24 pt-12 sm:pt-14">
          <div className="rounded-lg border border-ink-200 bg-[#efe9da] p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-amber-800/80">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-600 align-middle" />
                  Hàng đặt trước
                </p>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
                  Giữ suất kit mới, chỉ cọc 10%
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
                  Đặt trước để chắc chắn có hàng với giá tốt từ hãng. Thanh toán 90% còn lại khi
                  nhận hàng.
                </p>
              </div>
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
                {preOrderProducts.length} mẫu
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {preOrderProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Store visit / policies */}
      <section className="container-page pt-12 sm:pt-14">
        <div className="grid overflow-hidden rounded-lg border border-ink-200 bg-white lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <p className="eyebrow">Ghé cửa hàng</p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
              Xem kit trực tiếp trước khi mua
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
              Ghé shop để xem hộp, kiểm tra runner và được tư vấn chọn kit phù hợp với tay nghề.
            </p>

            <div className="mt-5 space-y-2.5 text-sm text-ink-700">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                {settings.shopAddress}
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                {settings.shopHotline}
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                09:00 – 21:00, hàng ngày
              </p>
            </div>

            <a
              href={zaloHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark mt-6 px-5"
            >
              Nhắn Zalo cho shop
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="border-t border-ink-200 bg-ink-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
              Mua hàng an tâm
            </p>
            <ul className="mt-5 space-y-5">
              <li className="flex items-start gap-3">
                <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" strokeWidth={1.6} />
                <div>
                  <p className="text-sm font-bold">Đổi trả trong 7 ngày</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
                    Áp dụng cho hàng lỗi do vận chuyển hoặc sai sản phẩm.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" strokeWidth={1.6} />
                <div>
                  <p className="text-sm font-bold">Kiểm hàng khi nhận</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
                    Được đồng kiểm với đơn vị vận chuyển trước khi thanh toán.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" strokeWidth={1.6} />
                <div>
                  <p className="text-sm font-bold">Hỗ trợ sau khi mua</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
                    Tư vấn dụng cụ, kỹ thuật lắp ráp và xử lý lỗi runner.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
