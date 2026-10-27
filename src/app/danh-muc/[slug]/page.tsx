import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Semantic Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header & H1 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-2">
          DANH MỤC GUNPLA BANDAI
        </span>
        {/* EXACTLY ONE H1 */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
          Mô Hình {category.name}
        </h1>
        {category.description && (
          <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 2} />
            ))}
          </div>

          {/* Real Pagination Links for SEO */}
          {totalPages > 1 && (
            <nav aria-label="Phân trang danh mục" className="flex items-center justify-center space-x-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={`/danh-muc/${category.slug}?page=${p}${brand ? `&brand=${brand}` : ""}`}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
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
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-base mb-4">
            Hiện chưa có mẫu mô hình nào trong danh mục này hoặc đang được cập nhật thêm hàng mới.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            ← Quay Lại Trang Chủ
          </Link>
        </div>
      )}
    </div>
  );
}
