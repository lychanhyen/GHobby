import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BASE_URL, SITE_NAME, SITE_DESCRIPTION, getOrganizationSchema } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} | Đà Nẵng & Toàn Quốc`,
    template: `%s | GHobby.vn`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Gundam Đà Nẵng",
    "Gunpla Bandai chính hãng",
    "Mô hình Gundam HG RG MG PG",
    "Figure anime",
    "Shop mô hình uy tín",
    "Pre-order Gunpla",
  ],
  authors: [{ name: "GHobby Team" }],
  creator: "GHobby Đà Nẵng",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: BASE_URL,
    siteName: "GHobby.vn",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "GHobby - Shop Mô Hình Gunpla & Figure",
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
  const orgSchema = getOrganizationSchema();

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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
