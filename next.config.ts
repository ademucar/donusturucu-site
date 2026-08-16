import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/*
 * İçerik Güvenliği Politikası (CSP)
 *
 * Uygulamanın gerçek ihtiyaçlarına göre yazıldı:
 *  - worker-src blob:  → pdf.js kendi worker'ını blob olarak başlatabiliyor
 *  - img-src blob:     → önizlemeler ve indirmeler blob URL kullanıyor
 *  - style-src inline  → Next.js ve Tailwind satır içi stil enjekte ediyor
 *  - connect-src 'self'→ EN ÖNEMLİSİ: dışarıya hiçbir veri gönderilemez
 *
 * Dev modunda HMR websocket ve eval gerektiği için CSP uygulanmıyor;
 * yayında (production) tam politika geçerli.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "connect-src 'self' blob: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Sayfanın başka bir sitede iframe'e gömülmesini engeller (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Tarayıcının içerik türünü tahmin etmesini engeller
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Dış sitelere tam adres sızdırma
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // İhtiyacımız olmayan cihaz izinlerini tamamen kapat
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
  },
  // Tarayıcı bu siteye sadece HTTPS ile bağlansın
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  ...(isDev ? [] : [{ key: "Content-Security-Policy", value: csp }]),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.10"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
