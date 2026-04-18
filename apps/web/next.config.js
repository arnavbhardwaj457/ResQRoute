/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@resqroute/types'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.basemaps.cartocdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.openstreetmap.org',
      },
    ],
  },
  // PWA headers for offline capability
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
