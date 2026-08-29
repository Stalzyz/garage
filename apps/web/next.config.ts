import type { NextConfig } from "next";

const API_INTERNAL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

const nextConfig: NextConfig = {
  compress: true, // Enable gzip/brotli compression on all responses
  allowedDevOrigins: ['192.168.0.220', 'localhost', '127.0.0.1'],

  // Image optimization — allow CDN and self-hosted image origins
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days browser-side image cache
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['academy.grekam.in', 'grekam.in', 'www.grekam.in', 'garage.grekam.in', 'localhost:3000', '127.0.0.1:3000'],
    },
  },

  async headers() {
    return [
      {
        // Dashboard & Portal pages — NEVER cache HTML/data to prevent stale chunk errors on deployment
        source: '/dashboard/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/dashboard',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        // Portal pages — NEVER cache HTML to prevent stale chunk errors on deployment
        source: '/portal/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/portal',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        // Static assets — aggressive long-term caching
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Uploaded media / public files
        source: '/public/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
      {
        // Fonts — long-lived cache
        source: '/_next/static/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Security headers applied globally
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'agency.grekam.in',
          },
        ],
        destination: '/agency',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.agency.grekam.in',
          },
        ],
        destination: '/agency',
      },
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

