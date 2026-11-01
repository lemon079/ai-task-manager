import type { NextConfig } from "next";

// Enforce install-only security: production builds must fail if the browser bypass escape hatch is set
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_ALLOW_BROWSER === "true"
) {
  throw new Error(
    "Security Violation: NEXT_PUBLIC_ALLOW_BROWSER cannot be set to true in a production build. NeuraTask is an install-only PWA."
  );
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
