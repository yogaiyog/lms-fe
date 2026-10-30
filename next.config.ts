import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output:
    process.env.BUILD_FOR_CAPACITOR === "true"
      ? "export"
      : process.env.BUILD_STANDALONE === "true"
        ? "standalone"
        : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
