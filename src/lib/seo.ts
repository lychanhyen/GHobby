import { Product } from "@/types/product";
import { getStoreSettings } from "@/lib/settings";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function generateProductJsonLd(product: Product) {
  const settings = getStoreSettings();
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
        name: settings.shopName,
      },
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
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

export function generateOrganizationJsonLd(settings?: any) {
  const shopSettings = settings || getStoreSettings();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: shopSettings.shopName,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: "Chuyên cung cấp mô hình Gunpla Bandai chính hãng, Figure anime cao cấp và phụ kiện mô hình.",
    address: {
      "@type": "PostalAddress",
      streetAddress: shopSettings.shopAddress,
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: shopSettings.shopHotline,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
  };
}

export function getOrganizationSchema() {
  const settings = getStoreSettings();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.shopName,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: "Chuyên cung cấp mô hình Gunpla Bandai chính hãng, Figure anime cao cấp và phụ kiện mô hình.",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.shopAddress,
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.shopHotline,
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
