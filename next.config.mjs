/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Pre-generated homepage photos: let browsers keep them for a week without re-checking.
  async headers() {
    return [{ source: '/images/opt/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }] }];
  }
};

export default nextConfig;
