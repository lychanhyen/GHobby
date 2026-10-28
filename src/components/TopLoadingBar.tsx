"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Thanh tiến trình xuất hiện trên đầu trang khi chuyển route (Instant Navigation).
 * Hoạt động với Next.js App Router qua usePathname.
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hiện thanh tiến trình khi pathname thay đổi
    setVisible(true);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setVisible(false);
      timer.current = null;
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-accent-600 z-[9999] transition-opacity duration-300"
      aria-label="Đang chuyển trang"
      role="progressbar"
    />
  );
}
