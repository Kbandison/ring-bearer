/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
