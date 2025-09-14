import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',

  eslint: {
    ignoreDuringBuilds: true,
},

};

export default nextConfig;
