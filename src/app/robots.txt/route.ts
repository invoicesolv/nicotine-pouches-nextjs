import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://nicotine-pouches.org/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /dashboard/

# Disallow problematic URLs that cause canonical issues
Disallow: /flavor/
Disallow: /flavour/
Disallow: /productlabel/
Disallow: /strength/
Disallow: /produkt/

# Disallow URLs with query parameters
Disallow: /*?*

# Allow important pages
Allow: /product/
Allow: /us/product/
Allow: /brand/
Allow: /us/brand/
Allow: /compare/
Allow: /us/compare/
Allow: /product-comparison/
Allow: /blog/
Allow: /us/blog/
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
