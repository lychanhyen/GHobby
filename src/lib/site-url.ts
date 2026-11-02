/**
 * Xác định URL công khai (canonical) của website.
 *
 * Thứ tự ưu tiên:
 * 1. NEXT_PUBLIC_SITE_URL        – biến khuyến nghị, đặt trên Vercel/Netlify...
 * 2. SITE_URL                    – biến phía server (không lộ ra client)
 * 3. NEXT_PUBLIC_BASE_URL        – biến cũ đang dùng trong project
 * 4. BASE_URL                    – biến phía server
 * 5. VERCEL_PROJECT_PRODUCTION_URL – domain production ổn định do Vercel cấp
 * 6. VERCEL_URL                  – domain của từng deployment do Vercel cấp
 * 7. Fallback: https://ghobby.vercel.app khi chạy production, http://localhost:3000 khi dev.
 *
 * Khi chạy production, các giá trị trỏ về localhost/127.0.0.1 sẽ bị bỏ qua để
 * sitemap/robots/canonical không bao giờ chứa URL nội bộ.
 */

const LOCAL_DEV_URL = "http://localhost:3000";
const PRODUCTION_FALLBACK_URL = "https://ghobby.vercel.app";

/** Thêm "https://" nếu thiếu protocol và bỏ dấu "/" ở cuối. */
export function normalizeSiteUrl(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.BASE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const url = normalizeSiteUrl(candidate);
    if (!url) continue;
    // Không để URL nội bộ lọt vào sitemap/canonical ở môi trường production.
    if (isProduction && isLocalUrl(url)) continue;
    return url;
  }

  return isProduction ? PRODUCTION_FALLBACK_URL : LOCAL_DEV_URL;
}
