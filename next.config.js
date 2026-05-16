/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/arabic-heaven',
  assetPrefix: '/arabic-heaven/',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
