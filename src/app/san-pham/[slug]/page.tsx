import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { formatCurrencyVND } from "@/lib/utils";
import { BASE_URL, getBreadcrumbSchema, getProductSchema } from "@/lib/seo";

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
  const description = `${product.name} chính hãng ${product.brand}. Dòng ${product.category?.name || "Gunpla"}, tỉ lệ ${product.scale}, series ${product.series}. Giá ${formatCurrencyVND(product.sellingPrice)}. GHobby Đà Nẵng ship toàn quốc 20K.`;
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

  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Main Product Container */}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Col 1: Product Image */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <Image
                src={product.imageUrl}
                alt={`Mô hình ${product.name} - ${product.scale} chính hãng ${product.brand}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isPreOrder && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500 text-white shadow-md">
                    ★ HÀNG PRE-ORDER (CỌC 10%)
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-white shadow-md">
                    TẠM HẾT HÀNG
                  </span>
                )}
                {!isOutOfStock && !isPreOrder && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-md">
                    CÒN HÀNG TRONG KHO ({product.stockQuantity} HỘP)
                  </span>
                )}
              </div>
            </div>

            {/* Packaging Guarantee Note */}
            <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">🛡️ Cam kết đóng gói an toàn từ GHobby:</p>
              <p>• Hộp kit được bọc 3 lớp bóng khí bọt dày, chèn xốp chuyên dụng.</p>
              <p>• Thùng carton 5 lớp cứng cáp, bảo vệ góc hộp nguyên vẹn khi vận chuyển.</p>
            </div>
          </div>

          {/* Col 2: Product Info & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Series */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                  {product.category?.name || "Gunpla Kit"}
                </span>
                <span>•</span>
                <span>{product.series}</span>
              </div>

              {/* EXACTLY ONE H1 */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-extrabold text-red-600">
                    {formatCurrencyVND(product.sellingPrice)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Giá đã bao gồm VAT)
                  </span>
                </div>

                {/* Deposit Explanation */}
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    Tiền cọc chuyển khoản (10%):
                  </span>
                  <span className="font-bold text-amber-600 text-sm">
                    {formatCurrencyVND(depositAmount)}
                  </span>
                </div>

                {isPreOrder && product.expectedReleaseDate && (
                  <div className="mt-2 text-xs text-amber-800 font-semibold">
                    📅 Dự kiến phát hành: {product.expectedReleaseDate}
                  </div>
                )}
              </div>

              {/* Specification Table */}
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Thông Số Kỹ Thuật Chi Tiết
                </h2>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50 border-b border-slate-200">
                    <span className="font-medium text-slate-500">Hãng sản xuất:</span>
                    <span className="font-semibold text-slate-900">{product.brand}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-white border-b border-slate-200">
                    <span className="font-medium text-slate-500">Tỉ lệ mô hình:</span>
                    <span className="font-semibold text-slate-900">{product.scale}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50 border-b border-slate-200">
                    <span className="font-medium text-slate-500">Dòng sản phẩm:</span>
                    <span className="font-semibold text-slate-900">{product.category?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-white border-b border-slate-200">
                    <span className="font-medium text-slate-500">Bộ phim / Series:</span>
                    <span className="font-semibold text-slate-900">{product.series}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50 border-b border-slate-200">
                    <span className="font-medium text-slate-500">Mã SKU quản lý kho:</span>
                    <span className="font-mono font-semibold text-slate-900">{product.sku}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-white">
                    <span className="font-medium text-slate-500">Tình trạng:</span>
                    <span className="font-semibold text-slate-900">
                      {isPreOrder
                        ? "Hàng đặt trước (Pre-order)"
                        : isOutOfStock
                        ? "Tạm hết hàng"
                        : `Có sẵn tại kho (${product.stockQuantity} bộ)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Mô Tả Sản Phẩm
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {isOutOfStock ? (
                <div className="p-4 rounded-xl bg-slate-100 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    Mẫu mô hình này hiện tạm thời hết hàng tại kho Đà Nẵng.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Bạn vui lòng tham khảo các mẫu kit tương tự được gợi ý ngay bên dưới!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/gio-hang?add=${product.id}`}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-center bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30"
                  >
                    {isPreOrder ? "Đặt Cọc Pre-Order Ngay (10%)" : "Mua Ngay (Cọc 10%)"}
                  </Link>
                  <Link
                    href="https://zalo.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 rounded-xl font-bold text-sm text-center bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Tư Vấn Zalo
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sản Phẩm Cùng Dòng Bạn Có Thể Thích
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
