"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export default function ClientLayout({
  children,
  settings,
  categories = [],
}: {
  children: React.ReactNode;
  settings?: any;
  categories?: any[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <Header settings={settings} categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} categories={categories} />
      </WishlistProvider>
    </CartProvider>
  );
}
