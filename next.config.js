/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Restuarant',
  assetPrefix: '/Restuarant/',
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
