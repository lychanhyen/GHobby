import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BASE_URL, generateOrganizationJsonLd } from "@/lib/seo";
import { getStoreSettings } from "@/lib/settings";
import { getCategories } from "@/lib/products";
import ClientLayout from "@/components/ClientLayout";
import TopLoadingBar from "@/components/TopLoadingBar";

// Header, hero và danh mục đều đọc từ DB nên phải render động,
// tránh bị đóng băng vào bản build tĩnh.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const siteTitle = `${settings.shopName} - Shop Mô Hình Gunpla & Figure Chính Hãng`;
  const siteDescription = `Chuyên cung cấp mô hình Gunpla Bandai chính hãng (HG, RG, MG, PG, SD), Figure anime cao cấp và dụng cụ lắp ráp tại ${settings.shopAddress}. Giao hàng toàn quốc, cọc 10% uy tín.`;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: `${siteTitle} | Chính Hãng & Uy Tín`,
      template: `%s | ${settings.shopName}`,
    },
    description: siteDescription,
    keywords: [
      "Gunpla Bandai chính hãng",
      "Mô hình Gundam HG RG MG PG",
      "Figure anime",
      "Shop mô hình uy tín",
      "Pre-order Gunpla",
    ],
    authors: [{ name: settings.shopName }],
    creator: settings.shopName,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: BASE_URL,
      siteName: settings.shopName,
      title: siteTitle,
      description: siteDescription,
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${settings.shopName} - Shop Mô Hình Gunpla & Figure`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  let categories = [];
  try {
    settings = await getStoreSettings();
  } catch {
    settings = {
      shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "GHobby Model Kit Shop",
      shopAddress: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Việt Nam",
      shopHotline: process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0905.123.456",
      shopEmail: process.env.NEXT_PUBLIC_SHOP_EMAIL || "support@ghobby.vn",
      bankId: process.env.NEXT_PUBLIC_SHOP_BANK_ID || "MB",
      bankAccount: process.env.NEXT_PUBLIC_SHOP_BANK_ACCOUNT || "",
      bankAccountName: process.env.NEXT_PUBLIC_SHOP_BANK_NAME || "GHOBBY SHOP",
      outerCityShippingFee: Number(process.env.NEXT_PUBLIC_OUTER_CITY_SHIPPING_FEE) || 20000,
      innerCityDistricts: (process.env.NEXT_PUBLIC_INNER_CITY_DISTRICTS || "")
        .split(",")
        .map((d: string) => d.trim())
        .filter(Boolean),
    };
  }
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  const orgSchema = generateOrganizationJsonLd(settings);

  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        {/* Organization JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-paper text-ink-950 antialiased">
        <TopLoadingBar />
        <ClientLayout settings={settings} categories={categories}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
