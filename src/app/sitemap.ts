import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. Các đường dẫn tĩnh
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date() },
    { url: `${baseUrl}/gio-hang`, lastModified: new Date() },
    { url: `${baseUrl}/tra-cuu-don-hang`, lastModified: new Date() },
  ];

  // 2. Lấy danh mục từ DB
  const categories = await prisma.category.findMany({ select: { slug: true, updatedAt: true } });
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/danh-muc/${cat.slug}`,
    lastModified: cat.updatedAt,
  }));

  // 3. Lấy sản phẩm từ DB
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
  const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${baseUrl}/san-pham/${prod.slug}`,
    lastModified: prod.updatedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}