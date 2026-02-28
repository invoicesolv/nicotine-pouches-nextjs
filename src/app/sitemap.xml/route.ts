import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { shouldExcludeFromSitemap } from '@/lib/redirects';

// Helper function to ensure proper ISO date format
function formatDate(date: any): string {
  if (!date) return new Date().toISOString();
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return new Date().toISOString();
    }
    return parsedDate.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

export async function GET() {
  try {
    const baseUrl = 'https://nicotine-pouches.org';
    const currentDate = new Date().toISOString();

    // Get all products for sitemap
    const { data: products, error: productsError } = await supabase()
      .from('wp_products')
      .select('name, image_url')
      .not('name', 'is', null);

    if (productsError) {
      console.error('Error fetching products for sitemap:', productsError);
    }

    // Get US products for sitemap
    const { data: usProducts, error: usProductsError } = await supabase()
      .from('us_products')
      .select('product_title, image_url')
      .not('product_title', 'is', null);

    if (usProductsError) {
      console.error('Error fetching US products for sitemap:', usProductsError);
    }

    // Get blog posts for sitemap (direct DB query — no self-fetch fragility)
    let blogPosts: any[] = [];
    try {
      const { data: dbPosts, error: blogError } = await supabase()
        .from('blog_posts')
        .select('slug, date')
        .in('status', ['publish', 'published'])
        .not('slug', 'is', null);

      if (blogError) {
        console.error('Error fetching blog posts for sitemap:', blogError);
      } else {
        blogPosts = dbPosts || [];
      }
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="https://www.google.com/schemas/sitemap-image/1.1">
`;

    // Track unique URLs to prevent duplicates
    const addedUrls = new Set<string>();

    // Add static pages (excluding duplicate content pages that canonical to features)
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/compare', priority: '0.9', changefreq: 'daily' },
      { url: '/about-us', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact-us', priority: '0.6', changefreq: 'monthly' },
      { url: '/become-a-member', priority: '0.8', changefreq: 'monthly' },
      { url: '/frequently-asked-questions', priority: '0.8', changefreq: 'monthly' },
      { url: '/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
      { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
      { url: '/how-to-use', priority: '0.7', changefreq: 'monthly' },
      { url: '/safe-online-shopping', priority: '0.6', changefreq: 'monthly' },
      { url: '/why-nicotine-pouches', priority: '0.7', changefreq: 'monthly' },
      { url: '/careers', priority: '0.6', changefreq: 'monthly' },
      { url: '/sustainability', priority: '0.6', changefreq: 'monthly' },
      { url: '/digital-services-act', priority: '0.5', changefreq: 'yearly' },
      { url: '/nicotine-pouches-api', priority: '0.6', changefreq: 'monthly' },
      { url: '/features', priority: '0.6', changefreq: 'monthly' }, // Only include features (canonical)
      // Exclude /news and /press as they canonical to /features
      { url: '/work-with-us', priority: '0.6', changefreq: 'monthly' },
      { url: '/here-we-are', priority: '0.6', changefreq: 'monthly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' },
      { url: '/guides', priority: '0.7', changefreq: 'weekly' },
      { url: '/vendors', priority: '0.6', changefreq: 'monthly' },
      { url: '/brands', priority: '0.8', changefreq: 'weekly' },
      // US pages
      { url: '/us', priority: '0.8', changefreq: 'daily' },
      { url: '/us/about-us', priority: '0.7', changefreq: 'monthly' },
      { url: '/us/contact-us', priority: '0.6', changefreq: 'monthly' },
      { url: '/us/become-a-member', priority: '0.8', changefreq: 'monthly' },
      { url: '/us/compare', priority: '0.9', changefreq: 'daily' },
      { url: '/us/frequently-asked-questions', priority: '0.8', changefreq: 'monthly' },
      { url: '/us/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
      { url: '/us/how-to-use', priority: '0.7', changefreq: 'monthly' },
      { url: '/us/safe-online-shopping', priority: '0.6', changefreq: 'monthly' },
      { url: '/us/why-nicotine-pouches', priority: '0.7', changefreq: 'monthly' },
      { url: '/us/careers', priority: '0.6', changefreq: 'monthly' },
      { url: '/us/sustainability', priority: '0.6', changefreq: 'monthly' },
      { url: '/us/nicotine-pouches-api', priority: '0.6', changefreq: 'monthly' },
      { url: '/us/work-with-us', priority: '0.6', changefreq: 'monthly' }
      // Exclude /us/blog as it redirects to /us
    ];

    staticPages.forEach(page => {
      const url = `${baseUrl}${page.url}`;
      if (!addedUrls.has(url)) {
        addedUrls.add(url);
        sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }
    });

    // Add product pages (UK only) - only include products that actually exist
    if (products) {
      // Filter out products that don't have proper data
      const validProducts = products.filter((product: any) => {
        return product.name && 
               product.name.trim() !== '' && 
               product.name !== 'null' && 
               product.name !== 'undefined';
      });
      
      console.log(`Found ${validProducts.length} valid products out of ${products.length} total products`);
      
      validProducts.forEach((product: any) => {
        // Create a more robust slug
        const slug = product.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (!slug || slug.length < 3) return; // Skip invalid slugs
        
        const productUrl = `${baseUrl}/product/${slug}`;
        
        // Check if this product should be excluded from sitemap (discontinued products)
        if (shouldExcludeFromSitemap(product.name, productUrl)) {
          console.log(`Excluding discontinued product from sitemap: ${product.name} -> ${productUrl}`);
          return; // Skip this product
        }
        
        if (!addedUrls.has(productUrl)) {
          addedUrls.add(productUrl);
          sitemap += `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

        // Add product image if available and valid
        if (product.image_url && product.image_url.startsWith('http')) {
          sitemap += `
    <image:image>
      <image:loc>${product.image_url}</image:loc>
      <image:title>${product.name.replace(/[<>&"']/g, '')}</image:title>
    </image:image>`;
        }

          sitemap += `
  </url>
`;
        }
      });
    }

    // Add US product pages (using the usProducts already fetched above)
    if (usProducts) {
      // Filter out invalid US products
      const validUsProducts = usProducts.filter((usProduct: any) => {
        return usProduct.product_title && 
               usProduct.product_title.trim() !== '' && 
               usProduct.product_title !== 'null' && 
               usProduct.product_title !== 'undefined';
      });
      
      console.log(`Found ${validUsProducts.length} valid US products out of ${usProducts.length} total US products`);
      
      validUsProducts.forEach((usProduct: any) => {
        // Create a more robust slug
        const slug = usProduct.product_title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (!slug || slug.length < 3) return; // Skip invalid slugs
        
        const usProductUrl = `${baseUrl}/us/product/${slug}`;
        
        // Check if this product should be excluded from sitemap (discontinued products)
        if (shouldExcludeFromSitemap(usProduct.product_title, usProductUrl)) {
          console.log(`Excluding discontinued US product from sitemap: ${usProduct.product_title} -> ${usProductUrl}`);
          return; // Skip this product
        }
        
        if (!addedUrls.has(usProductUrl)) {
          addedUrls.add(usProductUrl);
          sitemap += `  <url>
    <loc>${usProductUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
        }
      });
    }

    // Add blog posts (UK only) – canonical URL is root /slug
    if (blogPosts && blogPosts.length > 0) {
      blogPosts.forEach((post: any) => {
        // Validate blog post data
        if (!post.slug) return;
        
        const postDate = formatDate(post.date);
        const postUrl = `${baseUrl}/${post.slug}`;
        
        if (!addedUrls.has(postUrl)) {
          addedUrls.add(postUrl);
          sitemap += `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        }
      });
    }

    // Add brand pages from products (UK only)
    if (products) {
      // Filter out invalid products first
      const validProducts = products.filter((product: any) => {
        return product.name && 
               product.name.trim() !== '' && 
               product.name !== 'null' && 
               product.name !== 'undefined';
      });
      
      const brands = Array.from(new Set(validProducts.map((p: any) => p.name.split(' ')[0])))
        .filter(brand => brand && typeof brand === 'string' && brand.trim() !== '' && brand !== 'null' && brand !== 'undefined');
      
      console.log(`Found ${brands.length} unique brands`);
      
      brands.forEach((brand: any) => {
        if (typeof brand !== 'string') return; // Skip non-string brands
        
        const brandSlug = brand
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (!brandSlug || brandSlug.length < 2) return; // Skip invalid brand slugs
        
        const brandUrl = `${baseUrl}/brand/${brandSlug}`;
        
        // Check if this brand should be excluded from sitemap (discontinued brands)
        if (shouldExcludeFromSitemap(brand, brandUrl)) {
          console.log(`Excluding discontinued brand from sitemap: ${brand} -> ${brandUrl}`);
          return; // Skip this brand
        }
        
        if (!addedUrls.has(brandUrl)) {
          addedUrls.add(brandUrl);
          sitemap += `  <url>
    <loc>${brandUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        }
      });
    }

    // Add US brand pages from US products
    if (usProducts) {
      // Filter out invalid products first
      const validUSProducts = usProducts.filter((product: any) => {
        return product.product_title && 
               product.product_title.trim() !== '' && 
               product.product_title !== 'null' && 
               product.product_title !== 'undefined';
      });

      // Extract unique brands from US products
      // Known multi-word brands that need special handling
      const multiWordBrands = ['nic-s', 'juice head', 'white fox', 'on!'];
      // Brand aliases (products stored under different name than brand page)
      const brandAliases: Record<string, string> = {
        '2one': 'on',
      };

      const brandNames: string[] = validUSProducts.map((product: any) => {
        const title = product.product_title.toLowerCase();

        // Check for known multi-word brands first
        for (const brand of multiWordBrands) {
          if (title.startsWith(brand)) {
            return brand;
          }
        }

        // Default: extract first word (split on space only, not hyphen)
        let brandName = product.product_title.split(' ')[0].toLowerCase();

        // Apply brand aliases
        if (brandAliases[brandName]) {
          brandName = brandAliases[brandName];
        }

        return brandName;
      });
      const usBrands: string[] = Array.from(new Set(brandNames)).filter((brand: string) => brand && brand.length > 0);

      // Add US brand pages
      usBrands.forEach(brand => {
        const brandSlug = brand
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (!brandSlug || brandSlug.length < 2) return; // Skip invalid brand slugs

        const usBrandUrl = `${baseUrl}/us/brand/${brandSlug}`;
        
        // Check if this brand should be excluded from sitemap (discontinued brands)
        if (shouldExcludeFromSitemap(brand, usBrandUrl)) {
          console.log(`Excluding discontinued US brand from sitemap: ${brand} -> ${usBrandUrl}`);
          return; // Skip this brand
        }
        
        if (!addedUrls.has(usBrandUrl)) {
          addedUrls.add(usBrandUrl);
          sitemap += `  <url>
    <loc>${usBrandUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        }
      });
    }

    // Add location pages (UK cities)
    const ukCities = [
      'aberdeen', 'armagh', 'bangor-wales', 'bangor-northern-ireland', 'bath', 'belfast', 'birmingham', 'bradford', 'brighton-and-hove', 'bristol',
      'cambridge', 'canterbury', 'cardiff', 'carlisle', 'chelmsford', 'chester', 'chichester', 'city-of-london', 'city-of-westminster', 'colchester',
      'coventry', 'derby', 'derry', 'doncaster', 'dundee', 'dunfermline', 'durham', 'edinburgh', 'ely', 'exeter',
      'glasgow', 'gloucester', 'hereford', 'inverness', 'kingston-upon-hull', 'lancaster', 'leeds', 'leicester', 'lichfield', 'lincoln',
      'lisburn', 'liverpool', 'london', 'manchester', 'milton-keynes', 'newcastle-upon-tyne', 'newport', 'newry', 'norwich', 'nottingham',
      'oxford', 'perth', 'peterborough', 'plymouth', 'portsmouth', 'preston', 'ripon', 'salford', 'salisbury', 'sheffield',
      'southampton', 'southend-on-sea', 'st-albans', 'st-asaph', 'st-davids', 'stirling', 'stoke-on-trent', 'sunderland', 'swansea', 'truro',
      'wakefield', 'wells', 'winchester', 'wolverhampton', 'worcester', 'wrexham', 'york'
    ];

    ukCities.forEach(citySlug => {
      const cityUrl = `${baseUrl}/${citySlug}`;
      
      if (!addedUrls.has(cityUrl)) {
        addedUrls.add(cityUrl);
        sitemap += `  <url>
    <loc>${cityUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    });

    sitemap += `</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
