import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin workspace root to this project to avoid Next 16 inferring the parent
  // (we have lockfiles at both C:\Users\22304\ and C:\Users\22304\ZCodeProject\personal-website\).
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Next 16 prefers `new URL()` for remotePatterns (and accepts hostname as
    // either a string or a URL).
    remotePatterns: [
      new URL("https://raw.githubusercontent.com/**"),
      new URL("https://objects.githubusercontent.com/**"),
    ],
  },
};

export default nextConfig;
