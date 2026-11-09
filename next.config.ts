import type { NextConfig } from "next";

/*
 * HireMind — platform admin panel.
 *
 * Split out of hiremind_web so each app ships, deploys and rolls back on its own.
 * This app serves one hostname, so it carries no hostname-routing proxy — the
 * audience is decided by which app is deployed, not by a Host header.
 */
const nextConfig: NextConfig = {
  // Self-contained server build for the Docker image.
  output: "standalone",
  images: {
    unoptimized: true,
  },
  /*
   * Sent with every response. HSTS keeps the browser on TLS — without it the first
   * request of a session can go out in the clear. The rest close off MIME sniffing,
   * framing (clickjacking), referrer leakage of authenticated URLs, and device APIs
   * this app never uses.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
  /*
   * The browser never calls a backend directly — it calls same-origin /api/*, which
   * these rewrites proxy. That is why there is no CORS configuration anywhere.
   *
   * Next.js evaluates rewrites() at BUILD time, so these are build args in Docker,
   * not runtime env: changing one needs a rebuild. Never prefix them with
   * NEXT_PUBLIC_, which would expose them to the browser and bypass the proxy.
   */
  async rewrites() {
    const usersApi   = process.env.USERS_API_URL      ?? "http://localhost:5001/user-service";
    const companyApi = process.env.COMPANY_API_URL    ?? "http://localhost:5003/company-service";
    return [
      { source: "/api/users/:path*", destination: `${usersApi}/:path*` },
      { source: "/api/company/:path*", destination: `${companyApi}/:path*` },
    ];
  },
};

export default nextConfig;
