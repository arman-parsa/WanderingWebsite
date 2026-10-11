import type { NextConfig } from 'next';
import { STORE_URL } from './src/lib/siteConfig';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'Referrer-Policy',         value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Routes renamed to match their page names; keep old URLs (and any indexed
  // links / bookmarks) working with permanent redirects.
  async redirects() {
    return [
      { source: '/articles', destination: '/library', permanent: true },
      { source: '/map', destination: '/earth', permanent: true },
      // Temporary, so the store can later become a page on this site
      // without browsers having cached the redirect.
      { source: '/store', destination: STORE_URL, permanent: false },
    ];
  },
};

export default nextConfig;
