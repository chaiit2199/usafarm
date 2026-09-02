import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: false,

  crossOrigin: "anonymous",

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  sassOptions: {
    silenceDeprecations: ["import", "legacy-js-api"],
  },

  // DEV ONLY
  allowedDevOrigins: ["usafarm-agri.com"],

  // PROD — whitelist origin cho Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: ["usafarm-agri.com", "www.usafarm-agri.com"],
    },
  },
};

export default nextConfig;
