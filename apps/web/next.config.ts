import type { NextConfig } from "next";

const API_INTERNAL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.0.220', 'localhost', '127.0.0.1'],
  experimental: {
    serverActions: {
      allowedOrigins: ['academy.grekam.in', 'grekam.in', 'www.grekam.in', 'localhost:3000', '127.0.0.1:3000'],
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_INTERNAL}/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
