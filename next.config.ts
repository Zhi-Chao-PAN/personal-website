import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
