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
    // Next 16 only allows quality 75 unless listed here; 90 is used for the
    // full-screen hero and the About portrait.
    qualities: [75, 90],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Fonts and the globe's land data rarely change — let browsers keep
      // them for 30 days instead of revalidating on every page load.
      // (Give a file a new name if it's ever replaced.)
      {
        source: '/:dir(fonts|data)/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
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
