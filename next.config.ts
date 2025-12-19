import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/UniCalendar',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
