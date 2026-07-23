import type { NextConfig } from "next";

const API_INTERNAL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.220', 'localhost', '127.0.0.1'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_INTERNAL}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/academy/register',
        permanent: true,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
