import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `# ===========================================
# ROBOTS.TXT - nicotine-pouches.org
# Optimized for Traditional SEO + GEO (AI Search)
# ===========================================

# -----------------------------------------
# AI SEARCH ENGINE CRAWLERS (GEO Optimization)
# Explicitly allow for maximum AI visibility
# -----------------------------------------

# OpenAI - ChatGPT, GPT-4, etc.
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

User-agent: ChatGPT-User
Allow: /

# Anthropic - Claude AI
User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

User-agent: anthropic-ai
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

User-agent: Claude-Web
Allow: /

# Perplexity AI
User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

# Google AI (Bard/Gemini training)
User-agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

# Microsoft Copilot (uses Bing)
User-agent: Bingbot
Allow: /
Crawl-delay: 1
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

# Meta AI
User-agent: FacebookBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

# Apple AI (Siri, Apple Intelligence)
User-agent: Applebot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

# Cohere AI
User-agent: cohere-ai
Allow: /

# Common Crawl (used by many AI models)
User-agent: CCBot
Allow: /
Crawl-delay: 2
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /store/

# -----------------------------------------
# TRADITIONAL SEARCH ENGINE CRAWLERS
# -----------------------------------------

User-agent: Googlebot
Allow: /
Crawl-delay: 1
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /dashboard/
Disallow: /store/

User-agent: Googlebot-Image
Allow: /

# -----------------------------------------
# DEFAULT RULES (All Other Bots)
# -----------------------------------------

User-agent: *
Allow: /

# Sitemaps
Sitemap: https://nicotine-pouches.org/sitemap.xml

# LLM/AI Context File
# See: https://nicotine-pouches.org/llms.txt

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /dashboard/
Disallow: /store/

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
