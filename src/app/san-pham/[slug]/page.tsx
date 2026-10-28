import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import ProductPurchaseActions from "@/components/ProductPurchaseActions";
import WishlistButton from "@/components/WishlistButton";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { formatCurrencyVND } from "@/lib/utils";
import { BASE_URL, generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
    };
  }

  const title = `${product.name} - ${product.scale} ${product.brand}`;
  let settings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = { shopName: "GHobby Model Kit Shop" };
  }
  const description = `${product.name} chính hãng ${product.brand}. Dòng ${product.category?.name || "Gunpla"}, tỉ lệ ${product.scale}, series ${product.series}. Giá ${formatCurrencyVND(product.sellingPrice)}. Mua mô hình tại ${settings.shopName}, giao hàng toàn quốc.`;
  const canonicalUrl = `${BASE_URL}/san-pham/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | GHobby.vn`,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);
  let settings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = { shopName: "GHobby Model Kit Shop", shopHotline: "0905123456" };
  }
  const zaloHref = `https://zalo.me/${(settings.shopHotline || "").replace(/\D/g, "")}`;

  const isOutOfStock = product.productType === "IN_STOCK" && product.stockQuantity <= 0;
  const isPreOrder = product.productType === "PRE_ORDER";
  const depositAmount = Math.round(product.sellingPrice * 0.1);

  const breadcrumbItems = [
    { name: "Sản Phẩm", url: "/" },
    ...(product.category
      ? [{ name: product.category.name, url: `/danh-muc/${product.category.slug}` }]
      : []),
    { name: product.name, url: `/san-pham/${product.slug}` },
  ];

  const productSchema = generateProductJsonLd(product, settings);
  const breadcrumbSchema = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <div className="container-page py-6 sm:py-8">
      {/* Product & Breadcrumb JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Product */}
      <article className="mb-12 rounded-lg border border-ink-200 bg-white p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Col 1: Product Image */}
          <div className="self-start lg:sticky lg:top-24">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
              <Image
                src={product.imageUrl}
                alt={`Mô hình ${product.name} - ${product.scale} chính hãng ${product.brand}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Status Badges */}
              <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                {isPreOrder && (
                  <span className="rounded-sm bg-amber-100/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-900 backdrop-blur-sm">
                    Hàng pre-order · Cọc 10%
                  </span>
                )}
                {isOutOfStock && (
                  <span className="rounded-sm bg-ink-950/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                    Tạm hết hàng
                  </span>
                )}
                {!isOutOfStock && !isPreOrder && (
                  <span className="rounded-sm bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700 backdrop-blur-sm">
                    Còn hàng trong kho ({product.stockQuantity} hộp)
                  </span>
                )}
              </div>
            </div>

            {/* Packaging Guarantee Note */}
            <div className="mt-4 border-l-2 border-accent-600 bg-ink-50 px-4 py-3.5">
              <p className="text-xs font-bold text-ink-900">
                Cam kết đóng gói an toàn từ GHobby
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-ink-600">
                <li>Hộp kit được bọc 3 lớp bóng khí bọt dày, chèn xốp chuyên dụng.</li>
                <li>Thùng carton 5 lớp cứng cáp, bảo vệ góc hộp nguyên vẹn khi vận chuyển.</li>
              </ul>
            </div>
          </div>

          {/* Col 2: Product Info & Actions */}
          <div className="flex min-w-0 flex-col">
            <div>
              {/* Category & Series */}
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                <span className="rounded-sm bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700">
                  {product.category?.name || "Gunpla Kit"}
                </span>
                <span className="text-ink-300">/</span>
                <span>{product.series}</span>
              </div>

              {/* EXACTLY ONE H1 */}
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink-950 sm:text-[32px]">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="mt-5 rounded-lg border border-ink-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-3xl font-bold tracking-tight text-ink-950">
                    {formatCurrencyVND(product.sellingPrice)}
                  </span>
                  <span className="text-xs text-ink-500">(Giá đã bao gồm VAT)</span>
                </div>

                {/* Deposit Explanation */}
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink-100 pt-3 text-xs">
                  <span className="text-ink-600">Tiền cọc chuyển khoản (10%)</span>
                  <span className="text-sm font-bold text-amber-700">
                    {formatCurrencyVND(depositAmount)}
                  </span>
                </div>

                {isPreOrder && product.expectedReleaseDate && (
                  <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-amber-700">
                    <CalendarDays className="mt-px h-3.5 w-3.5 shrink-0" />
                    <span>
                      Dự kiến phát hành:{" "}
                      {typeof product.expectedReleaseDate === "string"
                        ? product.expectedReleaseDate
                        : new Date(product.expectedReleaseDate).toLocaleDateString("vi-VN", {
                            month: "long",
                            year: "numeric",
                          })}
                    </span>
                  </div>
                )}
              </div>

              {/* Specification List */}
              <div className="mt-6">
                <h2 className="eyebrow">Thông số kỹ thuật</h2>
                <dl className="mt-3 divide-y divide-ink-100 rounded-lg border border-ink-200 text-xs">
                  <div className="grid grid-cols-[128px_1fr] gap-3 px-3.5 py-2.5">
                    <dt className="text-ink-500">Hãng sản xuất</dt>
                    <dd className="font-medium text-ink-900">{product.brand}</dd>
                  </div>
                  <div className="grid grid-cols-[128px_1fr] gap-3 px-3.5 py-2.5">
                    <dt className="text-ink-500">Tỉ lệ mô hình</dt>
                    <dd className="font-medium text-ink-900">{product.scale}</dd>
                  </div>
                  <div className="grid grid-cols-[128px_1fr] gap-3 px-3.5 py-2.5">
                    <dt className="text-ink-500">Dòng sản phẩm</dt>
                    <dd className="font-medium text-ink-900">{product.category?.name}</dd>
                  </div>
                  <div className="grid grid-cols-[128px_1fr] gap-3 px-3.5 py-2.5">
                    <dt className="text-ink-500">Bộ phim / Series</dt>
                    <dd className="font-medium text-ink-900">{product.series}</dd>
                  </div>
                  <div className="grid grid-cols-[128px_1fr] gap-3 px-3.5 py-2.5">
                    <dt className="text-ink-500">Mã SKU</dt>
                    <dd className="font-mono font-medium text-ink-900">{product.sku}</dd>
                  </div>
                  <div className="grid grid-cols-[128px_1fr] gap-3 px-3.5 py-2.5">
                    <dt className="text-ink-500">Tình trạng</dt>
                    <dd className="font-medium text-ink-900">
                      {isPreOrder
                        ? "Hàng đặt trước (Pre-order)"
                        : isOutOfStock
                        ? "Tạm hết hàng"
                        : `Có sẵn tại kho (${product.stockQuantity} bộ)`}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="eyebrow">Mô tả sản phẩm</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5 border-t border-ink-200 pt-5">
              <ProductPurchaseActions product={product} />
              <Link
                href={zaloHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline h-11 w-full gap-2 px-6"
              >
                <MessageCircle className="h-4 w-4" />
                Tư Vấn Zalo
              </Link>

              <WishlistButton product={product} className="w-full" />
            </div>
          </div>
        </div>
      </article>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-ink-200 pb-4">
            <div>
              <p className="eyebrow">Gợi ý cho bạn</p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink-950">
                Sản Phẩm Cùng Dòng Bạn Có Thể Thích
              </h2>
            </div>
            <p className="hidden text-xs text-ink-500 sm:block">{relatedProducts.length} sản phẩm</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
