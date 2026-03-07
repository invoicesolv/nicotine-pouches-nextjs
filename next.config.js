/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nicotine-pouches.org',
      },
      {
        protocol: 'https',
        hostname: 'gianna.templweb.com',
      },
      {
        protocol: 'https',
        hostname: 'twowombats.com',
      },
      {
        protocol: 'https',
        hostname: 'vyolbmzuezpoqtdgongz.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year in seconds
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-tabs', 'framer-motion'],
  },
  // Target modern browsers only - no legacy polyfills
  transpilePackages: [],
  async headers() {
    return [
      {
        // Set Content-Type with charset for HTML pages (fixes Lighthouse charset audit)
        // This matches all page routes (not api, not static files)
        source: '/:path((?!api|_next|.*\\..*).*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
        ],
      },
      {
        // Cache static assets
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js optimized images for 1 year
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=31536000',
          },
        ],
      },
      {
        // Cache images in public folder
        source: '/:path*.(png|jpg|jpeg|gif|webp|svg|ico|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache blog images
        source: '/blog-images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache product images
        source: '/product-images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache brand logos
        source: '/brand-logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache vendor logos
        source: '/vendor-logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/:path*.(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply security headers to all routes (except static assets)
        source: '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif|woff|woff2)).*)',
        headers: [
          // X-Frame-Options: Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-Content-Type-Options: Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-XSS-Protection: Enable XSS filtering
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer-Policy: Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Content Security Policy: Comprehensive protection
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://www.googleadservices.com https://adservice.google.com https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.vercel.app https://www.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://*.doubleclick.net https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.googlesyndication.com https://adservice.google.com",
              "frame-src https://www.youtube.com https://youtube.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Permissions Policy: Control browser features
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()'
            ].join(', ')
          },
          // Strict-Transport-Security: Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Cache control for HTML pages only
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  async redirects() {
    return []
  },
}

module.exports = nextConfig
