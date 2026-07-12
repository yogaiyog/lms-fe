import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_FOR_CAPACITOR === "true" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
