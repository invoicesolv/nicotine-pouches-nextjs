const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to format date
function formatDate(date) {
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

async function generateExpectedUrls() {
  const baseUrl = 'https://nicotine-pouches.org';
  const expectedUrls = new Set();

  // Add static pages
  const staticPages = [
    '/', '/compare', '/about-us', '/contact-us', '/become-a-member', 
    '/frequently-asked-questions', '/terms-and-conditions', '/privacy-policy',
    '/how-to-use', '/safe-online-shopping', '/why-nicotine-pouches', '/careers',
    '/sustainability', '/digital-services-act', '/nicotine-pouches-api', '/features',
    '/news', '/press', '/work-with-us', '/blog', '/guides', '/vendors',
    // US pages
    '/us', '/us/about-us', '/us/contact-us', '/us/become-a-member', '/us/compare',
    '/us/frequently-asked-questions', '/us/terms-and-conditions', '/us/how-to-use',
    '/us/safe-online-shopping', '/us/why-nicotine-pouches', '/us/careers',
    '/us/sustainability', '/us/nicotine-pouches-api', '/us/work-with-us', '/us/blog'
  ];

  staticPages.forEach(page => {
    expectedUrls.add(`${baseUrl}${page}`);
  });

  // Add UK cities
  const ukCities = [
    'aberdeen', 'armagh', 'bangor-wales', 'bangor-northern-ireland', 'bath', 'belfast', 
    'birmingham', 'bradford', 'brighton-and-hove', 'bristol', 'cambridge', 'canterbury', 
    'cardiff', 'carlisle', 'chelmsford', 'chester', 'chichester', 'city-of-london', 
    'city-of-westminster', 'colchester', 'coventry', 'derby', 'derry', 'doncaster', 
    'dundee', 'dunfermline', 'durham', 'edinburgh', 'ely', 'exeter', 'glasgow', 
    'gloucester', 'hereford', 'inverness', 'kingston-upon-hull', 'lancaster', 'leeds', 
    'leicester', 'lichfield', 'lincoln', 'lisburn', 'liverpool', 'london', 'manchester', 
    'milton-keynes', 'newcastle-upon-tyne', 'newport', 'newry', 'norwich', 'nottingham',
    'oxford', 'perth', 'peterborough', 'plymouth', 'portsmouth', 'preston', 'ripon', 
    'salford', 'salisbury', 'sheffield', 'southampton', 'southend-on-sea', 'st-albans', 
    'st-asaph', 'st-davids', 'stirling', 'stoke-on-trent', 'sunderland', 'swansea', 
    'truro', 'wakefield', 'wells', 'winchester', 'wolverhampton', 'worcester', 'wrexham', 'york'
  ];

  ukCities.forEach(city => {
    expectedUrls.add(`${baseUrl}/${city}`);
  });

  try {
    // Get UK products
    console.log('Fetching UK products...');
    const { data: products, error: productsError } = await supabase
      .from('wp_products')
      .select('name')
      .not('name', 'is', null);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else if (products) {
      const validProducts = products.filter(product => {
        return product.name && 
               product.name.trim() !== '' && 
               product.name !== 'null' && 
               product.name !== 'undefined';
      });

      console.log(`Found ${validProducts.length} valid UK products`);

      validProducts.forEach(product => {
        const slug = createSlug(product.name);
        if (slug && slug.length >= 3) {
          expectedUrls.add(`${baseUrl}/product/${slug}`);
        }
      });
    }

    // Get US products
    console.log('Fetching US products...');
    const { data: usProducts, error: usProductsError } = await supabase
      .from('us_products')
      .select('product_title')
      .not('product_title', 'is', null);

    if (usProductsError) {
      console.error('Error fetching US products:', usProductsError);
    } else if (usProducts) {
      const validUsProducts = usProducts.filter(usProduct => {
        return usProduct.product_title && 
               usProduct.product_title.trim() !== '' && 
               usProduct.product_title !== 'null' && 
               usProduct.product_title !== 'undefined';
      });

      console.log(`Found ${validUsProducts.length} valid US products`);

      validUsProducts.forEach(usProduct => {
        const slug = createSlug(usProduct.product_title);
        if (slug && slug.length >= 3) {
          expectedUrls.add(`${baseUrl}/us/product/${slug}`);
        }
      });
    }

    // Get blog posts
    console.log('Fetching blog posts...');
    try {
      const response = await fetch(`${baseUrl}/api/blog-posts`);
      if (response.ok) {
        const blogPosts = await response.json();
        console.log(`Found ${blogPosts.length} blog posts`);

        blogPosts.forEach(post => {
          if (post.slug) {
            expectedUrls.add(`${baseUrl}/blog/${post.slug}`);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }

    // Get brand pages from UK products
    if (products) {
      const validProducts = products.filter(product => {
        return product.name && 
               product.name.trim() !== '' && 
               product.name !== 'null' && 
               product.name !== 'undefined';
      });

      const brands = Array.from(new Set(validProducts.map(p => p.name.split(' ')[0])))
        .filter(brand => brand && typeof brand === 'string' && brand.trim() !== '' && brand !== 'null' && brand !== 'undefined');

      console.log(`Found ${brands.length} unique brands`);

      brands.forEach(brand => {
        if (typeof brand === 'string') {
          const brandSlug = createSlug(brand);
          if (brandSlug && brandSlug.length >= 2) {
            expectedUrls.add(`${baseUrl}/brand/${brandSlug}`);
          }
        }
      });
    }

  } catch (error) {
    console.error('Error generating expected URLs:', error);
  }

  return expectedUrls;
}

async function main() {
  try {
    // Read indexed URLs from CSV
    console.log('Reading indexed URLs from CSV...');
    const csvPath = '/Users/solvifyab/Desktop/NP/Tabell.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').slice(1); // Skip header
    
    const indexedUrls = new Set();
    lines.forEach(line => {
      if (line.trim()) {
        const [url] = line.split(',');
        if (url && url.trim()) {
          indexedUrls.add(url.trim());
        }
      }
    });

    console.log(`Found ${indexedUrls.size} indexed URLs`);

    // Generate expected URLs
    console.log('Generating expected URLs...');
    const expectedUrls = await generateExpectedUrls();
    console.log(`Generated ${expectedUrls.size} expected URLs`);

    // Find missing URLs
    const missingUrls = [];
    expectedUrls.forEach(url => {
      if (!indexedUrls.has(url)) {
        missingUrls.push(url);
      }
    });

    console.log(`Found ${missingUrls.length} missing URLs`);

    // Generate CSV report
    const csvReport = ['URL,Status,Last_Indexed'];
    missingUrls.forEach(url => {
      csvReport.push(`${url},Not Indexed,`);
    });

    // Also add URLs that are indexed but not expected (for reference)
    const unexpectedUrls = [];
    indexedUrls.forEach(url => {
      if (!expectedUrls.has(url)) {
        unexpectedUrls.push(url);
      }
    });

    if (unexpectedUrls.length > 0) {
      csvReport.push(''); // Empty line separator
      csvReport.push('# Unexpected URLs (indexed but not in sitemap)');
      unexpectedUrls.forEach(url => {
        csvReport.push(`${url},Unexpected,`);
      });
    }

    // Write report
    const reportPath = '/Users/solvifyab/Desktop/NP/missing-urls-report.csv';
    fs.writeFileSync(reportPath, csvReport.join('\n'));

    console.log(`\nReport generated: ${reportPath}`);
    console.log(`Missing URLs: ${missingUrls.length}`);
    console.log(`Unexpected URLs: ${unexpectedUrls.length}`);
    console.log(`Total indexed: ${indexedUrls.size}`);
    console.log(`Total expected: ${expectedUrls.size}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
