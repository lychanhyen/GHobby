import { Product } from "@/types/product";

export const SITE_NAME = "GHobby - Shop Mô Hình Gundam & Figure Chính Hãng";
export const SITE_DESCRIPTION =
  "Chuyên cung cấp mô hình Gunpla Bandai chính hãng (HG, RG, MG, PG, SD), Figure anime, dụng cụ lắp ráp. Giao hàng toàn quốc, cọc 10%, uy tín tại Đà Nẵng.";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GHobby Model Kit Shop",
    alternateName: "GHobby Đà Nẵng",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Khu vực Hải Châu",
      addressLocality: "Đà Nẵng",
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-905-123-456",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
  };
}

export function getProductSchema(product: Product) {
  let availability = "https://schema.org/InStock";
  if (product.productType === "PRE_ORDER") {
    availability = "https://schema.org/PreOrder";
  } else if (product.stockQuantity <= 0) {
    availability = "https://schema.org/OutOfStock";
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Bandai Spirits",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/san-pham/${product.slug}`,
      priceCurrency: "VND",
      price: product.sellingPrice,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: availability,
      seller: {
        "@type": "Organization",
        name: "GHobby",
      },
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
