/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'adsphere.io', 'avatars.githubusercontent.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
