import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const baseUrl = 'https://nicotine-pouches.org';
    const currentDate = new Date().toISOString();

    // Get site statistics from database
    const [productsResult, vendorsResult, blogResult] = await Promise.all([
      supabase().from('wp_products').select('name, brand, strength_mg, flavour, format, pouch_count').not('name', 'is', null),
      supabase().from('vendor_products').select('vendor_name, logo').not('vendor_name', 'is', null),
      fetch(`${baseUrl}/api/blog-posts`).then(res => res.ok ? res.json() : [])
    ]);

    const products = productsResult.data || [];
    const vendors = vendorsResult.data || [];
    const blogPosts = blogResult || [];

    // Extract unique values for structured data
    const brands = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean)));
    const flavours = Array.from(new Set(products.map((p: any) => p.flavour).filter(Boolean)));
    const strengths = Array.from(new Set(products.map((p: any) => p.strength_mg).filter(Boolean))).sort((a: any, b: any) => a - b);
    const formats = Array.from(new Set(products.map((p: any) => p.format).filter(Boolean)));
    const pouchCounts = Array.from(new Set(products.map((p: any) => p.pouch_count).filter(Boolean))).sort((a: any, b: any) => a - b);
    const vendorNames = Array.from(new Set(vendors.map((v: any) => v.vendor_name).filter(Boolean)));

    // Generate dynamic LLM.txt content
    const llmContent = `# LLM.txt for Nicotine Pouches

## Site Information
- Site Name: Nicotine Pouches
- Domain: nicotine-pouches.org
- Language: English (en-GB, en-US)
- Type: Nicotine Pouches comparison site
- Last Updated: ${currentDate}
- Total Products: ${products.length}
- Total Vendors: ${vendorNames.length}
- Total Blog Posts: ${blogPosts.length}

## Site Structure
- Homepage: ${baseUrl}/
- US Homepage: ${baseUrl}/us/
- Product Pages: ${baseUrl}/product/[slug]
- US Product Pages: ${baseUrl}/us/product/[slug]
- Blog: ${baseUrl}/blog/
- US Blog: ${baseUrl}/us/blog/
- Brand Pages: ${baseUrl}/brand/[slug]
- US Brand Pages: ${baseUrl}/us/brand/[slug]

## Content Focus
- Nicotine pouches comparison and reviews
- Product specifications and pricing
- Vendor comparisons and ratings
- Health and safety information
- Usage guides and tutorials
- Brand information and reviews

## Key Features
- Real-time price comparison
- Vendor ratings and reviews
- Product specifications
- Pack size options: ${pouchCounts.join(', ')} pouches
- Strength options: ${strengths.join('mg, ')}mg
- Flavor categories: ${flavours.slice(0, 10).join(', ')}${flavours.length > 10 ? `, and ${flavours.length - 10} more` : ''}
- Brand categories: ${brands.slice(0, 10).join(', ')}${brands.length > 10 ? `, and ${brands.length - 10} more` : ''}
- Format types: ${formats.join(', ')}

## Available Brands
${brands.map(brand => `- ${brand}`).join('\n')}

## Available Flavours
${flavours.map(flavour => `- ${flavour}`).join('\n')}

## Available Strengths
${strengths.map(strength => `- ${strength}mg`).join('\n')}

## Available Vendors
${vendorNames.map(vendor => `- ${vendor}`).join('\n')}

## Data Sources
- Supabase database (wp_products, us_products, vendor_products)
- Real-time pricing from multiple vendors
- User-generated reviews and ratings
- Product specifications from manufacturers

## API Endpoints
- /api/vendor-analytics - Vendor interaction tracking
- /api/vendor-click-tracking - Click tracking
- /api/products - Product data
- /api/vendors - Vendor information
- /api/blog-posts - Blog post data
- /sitemap.xml - Dynamic sitemap
- /robots.txt - Dynamic robots.txt

## SEO Features
- Structured data (JSON-LD)
- Open Graph tags
- Twitter Cards
- Hreflang tags for internationalization
- LLM-optimized content generation
- Dynamic meta tags
- Dynamic sitemap generation

## Technical Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase
- Google Analytics 4
- Google Search Console

## Content Guidelines
- Age verification required (21+)
- Health warnings included
- Accurate product information
- Transparent pricing
- User safety prioritized

## Contact
- About Us: ${baseUrl}/about-us
- Contact: ${baseUrl}/contact-us
- US Contact: ${baseUrl}/us/contact-us

## Recent Blog Posts
${blogPosts.slice(0, 5).map((post: any) => `- ${post.title} (${post.slug})`).join('\n')}

## Sample Products
${products.slice(0, 10).map((product: any) => `- ${product.name} (${product.brand} ${product.strength_mg}mg ${product.flavour})`).join('\n')}

---
Generated dynamically on ${currentDate}
Total data points: ${products.length + vendors.length + blogPosts.length}
`;

    return new NextResponse(llmContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating llm.txt:', error);
    return new NextResponse('Error generating llm.txt', { status: 500 });
  }
}
