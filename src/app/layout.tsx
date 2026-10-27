import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BASE_URL, getOrganizationSchema, generateOrganizationJsonLd } from "@/lib/seo";
import { getStoreSettings } from "@/lib/settings";
import { CartProvider } from "@/context/CartContext";

const settings = getStoreSettings();
const siteTitle = `${settings.shopName} - Shop Mô Hình Gunpla & Figure Chính Hãng`;
const siteDescription = `Chuyên cung cấp mô hình Gunpla Bandai chính hãng (HG, RG, MG, PG, SD), Figure anime cao cấp và dụng cụ lắp ráp tại ${settings.shopAddress}. Giao hàng toàn quốc, cọc 10% uy tín.`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
