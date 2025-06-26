import type { NextConfig } from "next";

// Get base path from env or default
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath,
  // Include trailing slash in assets
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // Support GitHub Pages by disabling image optimization
  images: {
    unoptimized: true,
  },
  // Ensure GitHub Pages uses the correct path
  trailingSlash: true,
};

export default nextConfig;
