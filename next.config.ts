import type { NextConfig } from "next";

// Security headers from docs/03-design/security-privacy.md §7 (threats T-03, T-04).
// CSP only in production: the dev server needs eval for hot reload.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // Next.js inline bootstrap scripts
  "style-src 'self' 'unsafe-inline'", // Leaflet positions tiles with inline styles
  "img-src 'self' data: blob: https:", // OSM tiles + organisers' event images
  "font-src 'self'", // next/font serves fonts from this site
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
