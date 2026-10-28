import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/products";
import { BASE_URL, getBreadcrumbSchema } from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; brand?: string }>;
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page, brand } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Không tìm thấy danh mục",
    };
  }

  const title = `Mô Hình ${category.name} Chính Hãng Bandai Giá Tốt`;
  const description =
    category.description ||
    `Danh sách mô hình ${category.name} chính hãng Bandai Spirits tại GHobby. Cập nhật mẫu mới nhất, giá rẻ, hỗ trợ ship toàn quốc.`;

  // Rule 11: Canonical của phân trang trỏ chính trang đó; trang lọc trỏ về danh mục gốc
  let canonicalUrl = `${BASE_URL}/danh-muc/${category.slug}`;
  if (page && Number(page) > 1 && !brand) {
    canonicalUrl = `${BASE_URL}/danh-muc/${category.slug}?page=${page}`;
  }

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
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page, brand } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const allCategoryProducts = await getProducts({
    categoryId: category.id,
    brand: brand || undefined,
  });

  const currentPage = parseInt(page || "1", 10) || 1;
  const pageSize = 8;
  const totalItems = allCategoryProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const displayedProducts = allCategoryProducts.slice(startIndex, startIndex + pageSize);

  const breadcrumbItems = [
    { name: "Danh Mục", url: "/" },
    { name: category.name, url: `/danh-muc/${category.slug}` },
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="container-page py-6 sm:py-8">
      {/* Breadcrumb Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Semantic Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header & H1 */}
      <div className="mb-7 border-b border-ink-200 pb-6">
        <p className="eyebrow">DANH MỤC GUNPLA BANDAI</p>
        {/* EXACTLY ONE H1 */}
        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          Mô Hình {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500">
            {category.description}
          </p>
        )}
        <p className="mt-3 text-xs font-medium text-ink-400">
          {totalItems} sản phẩm
        </p>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {displayedProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 2} />
            ))}
          </div>

          {/* Real Pagination Links for SEO */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang danh mục" className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={`/danh-muc/${category.slug}?page=${p}${brand ? `&brand=${brand}` : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors duration-200 ${
                      isActive
                        ? "border-ink-950 bg-ink-950 text-white"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-950"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-500">
            Hiện chưa có mẫu mô hình nào trong danh mục này hoặc đang được cập nhật thêm hàng mới.
          </p>
          <Link href="/" className="btn-dark mt-5 px-5">
            <ArrowLeft className="h-4 w-4" />
            Quay Lại Trang Chủ
          </Link>
        </div>
      )}
    </div>
  );
}
