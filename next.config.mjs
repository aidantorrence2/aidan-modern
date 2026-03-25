/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  images: {},
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
