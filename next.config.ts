import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotografije stoje lokalno u /public/images, ali ostavljamo moderne formate
    // kako bi Next.js automatski servirao AVIF/WebP gdje je podržano.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Admin nikada ne smije završiti u pretraživačima.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
