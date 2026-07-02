import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",

  reactStrictMode: true,

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
