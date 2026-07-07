import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",

  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "x-content-type-options", value: "nosniff" },
          { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
          {
            key: "permissions-policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },

  // Next optimizes <Image> on the fly
  // The posters will come from MinIO—any other image source will be REJECTED.
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000", // MinIO en dev
      },
    ],
  },
}

export default nextConfig
