import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// robots.txt phải trỏ đúng domain đang chạy -> render động theo môi trường.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/don-hang/", "/profile/", "/thanh-toan/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
