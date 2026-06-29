import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin workspace root to this project to avoid Next 16 inferring the parent
  // (we have lockfiles at both C:\Users\22304\ and C:\Users\22304\ZCodeProject\personal-website\).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
