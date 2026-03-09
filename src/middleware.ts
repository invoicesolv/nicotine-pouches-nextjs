import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// Rate limit tiers (requests per window)
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  // Strict: auth & write endpoints
  '/api/signup': { limit: 5, windowMs: 60_000 },
  '/api/price-alert': { limit: 10, windowMs: 60_000 },
  '/api/submit-application': { limit: 5, windowMs: 60_000 },
  '/api/store/apply': { limit: 5, windowMs: 60_000 },
  '/api/store/auth': { limit: 30, windowMs: 60_000 },
  '/api/stock-notification': { limit: 10, windowMs: 60_000 },
  // Moderate: data-heavy read endpoints
  '/api/products': { limit: 30, windowMs: 60_000 },
  '/api/vendor-prices': { limit: 30, windowMs: 60_000 },
  '/api/vendor-products': { limit: 30, windowMs: 60_000 },
  '/api/trending-products': { limit: 30, windowMs: 60_000 },
  '/api/reviews': { limit: 30, windowMs: 60_000 },
  '/api/pack-prices': { limit: 30, windowMs: 60_000 },
  '/api/blog-posts': { limit: 30, windowMs: 60_000 },
  '/api/guides': { limit: 30, windowMs: 60_000 },
}

// Default limit for any /api/ route not listed above
const DEFAULT_API_LIMIT = { limit: 60, windowMs: 60_000 }

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function getRateLimit(pathname: string): { limit: number; windowMs: number } | null {
  if (!pathname.startsWith('/api/')) return null

  // Check specific routes (longest prefix match)
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      return config
    }
  }

  // Crawler/admin/cron routes get higher limits (internal use)
  if (
    pathname.startsWith('/api/crawler/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/cron/')
  ) {
    return { limit: 120, windowMs: 60_000 }
  }

  return DEFAULT_API_LIMIT
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const config = getRateLimit(pathname)
  if (config) {
    const ip = getIp(request)
    // Group rate limit by route prefix (e.g. /api/products/123 -> /api/products)
    const routeKey = pathname.split('/').slice(0, 3).join('/')
    const { success, remaining } = rateLimit(ip, routeKey, config)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(config.limit))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
