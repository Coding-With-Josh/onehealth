import type { NextConfig } from "next";

/**
 * API upstream for the same-origin rewrite below. The browser only ever
 * talks to THIS app; the rewrite proxies /api/v1/* to the Django API
 * server-side. That removes CORS entirely and keeps the API origin
 * hidden from clients (Phase 1 B2 — dumb pass-through; all authz still
 * enforced by the API itself).
 *
 * Override with API_UPSTREAM when the backend moves (server-side env —
 * never NEXT_PUBLIC_, it would leak to the browser).
 */
const API_UPSTREAM = process.env.API_UPSTREAM ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  images: {
    // Allow-list for remote images: only the Cloudinary host used by the
    // sign-in page mockups. No wildcards or other hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Django's APPEND_SLASH cannot redirect POSTs (RuntimeError). Next strips
  // trailing slashes by default, which would turn our /auth/login/ POST into
  // /auth/login on the wire and break every write endpoint. Preserve them.
  trailingSlash: true,
  async rewrites() {
    return [
      {
        // Next strips trailing slashes from `:path*` captures, but Django's
        // APPEND_SLASH refuses POST redirects (RuntimeError). Every API route
        // ends in "/" (verified against all urlpatterns), so append it back.
        // Pure gateway: forwards raw bytes, adds no authz; Django remains the
        // enforcement point.
        source: "/api/v1/:path*",
        destination: `${API_UPSTREAM}/api/v1/:path*/`,
      },
    ];
  },
};

export default nextConfig;