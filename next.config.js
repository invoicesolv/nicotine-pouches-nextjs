/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gianna.templweb.com',
      },
      {
        protocol: 'https',
        hostname: 'twowombats.com',
      },
    ],
    unoptimized: true, // Allow local images to be served
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
