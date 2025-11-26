const fs = require('fs');
const path = require('path');

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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
    // Load UK products from JSON file
    console.log('Loading UK products from JSON...');
    const productsPath = path.join(__dirname, 'extracted-products', 'wordpress_products_data.json');
    if (fs.existsSync(productsPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      console.log(`Found ${productsData.length} UK products`);

      productsData.forEach(product => {
        if (product.name && product.name.trim() !== '') {
          const slug = createSlug(product.name);
          if (slug && slug.length >= 3) {
            expectedUrls.add(`${baseUrl}/product/${slug}`);
          }
        }
      });
    }

    // Load US products from JSON file
    console.log('Loading US products from JSON...');
    const usProductsPath = path.join(__dirname, 'extracted-products', 'wordpress_products_data.json');
    if (fs.existsSync(usProductsPath)) {
      // Try to find US products in the same file or separate file
      const usProductsData = JSON.parse(fs.readFileSync(usProductsPath, 'utf8'));
      const usProducts = usProductsData.filter(p => p.product_title || p.title);
      console.log(`Found ${usProducts.length} US products`);

      usProducts.forEach(product => {
        const title = product.product_title || product.title;
        if (title && title.trim() !== '') {
          const slug = createSlug(title);
          if (slug && slug.length >= 3) {
            expectedUrls.add(`${baseUrl}/us/product/${slug}`);
          }
        }
      });
    }

    // Load blog posts
    console.log('Loading blog posts...');
    const blogPostsPath = path.join(__dirname, 'all_blog_posts_with_content.json');
    if (fs.existsSync(blogPostsPath)) {
      const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));
      console.log(`Found ${blogPosts.length} blog posts`);

      blogPosts.forEach(post => {
        if (post.slug) {
          expectedUrls.add(`${baseUrl}/blog/${post.slug}`);
        }
      });
    }

    // Generate brand pages from UK products
    if (fs.existsSync(productsPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      const validProducts = productsData.filter(product => {
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
    const indexedUrlsWithDates = new Map();
    
    lines.forEach(line => {
      if (line.trim()) {
        const [url, lastIndexed] = line.split(',');
        if (url && url.trim()) {
          const cleanUrl = url.trim();
          indexedUrls.add(cleanUrl);
          indexedUrlsWithDates.set(cleanUrl, lastIndexed ? lastIndexed.trim() : '');
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

    // Find URLs that are indexed but not expected
    const unexpectedUrls = [];
    indexedUrls.forEach(url => {
      if (!expectedUrls.has(url)) {
        unexpectedUrls.push(url);
      }
    });

    console.log(`Found ${missingUrls.length} missing URLs`);
    console.log(`Found ${unexpectedUrls.length} unexpected URLs`);

    // Generate detailed CSV report
    const csvReport = ['URL,Status,Last_Indexed,Category'];
    
    // Add missing URLs
    missingUrls.forEach(url => {
      let category = 'Unknown';
      if (url.includes('/product/')) category = 'Product Page';
      else if (url.includes('/us/product/')) category = 'US Product Page';
      else if (url.includes('/brand/')) category = 'Brand Page';
      else if (url.includes('/blog/')) category = 'Blog Post';
      else if (url.includes('/us/')) category = 'US Page';
      else if (url.match(/\/[a-z-]+$/)) category = 'Location Page';
      else category = 'Static Page';
      
      csvReport.push(`${url},Not Indexed,,${category}`);
    });

    // Add unexpected URLs (indexed but not in sitemap)
    if (unexpectedUrls.length > 0) {
      csvReport.push(''); // Empty line separator
      csvReport.push('# Unexpected URLs (indexed but not in sitemap)');
      unexpectedUrls.forEach(url => {
        const lastIndexed = indexedUrlsWithDates.get(url) || '';
        let category = 'Unknown';
        if (url.includes('/product/')) category = 'Product Page';
        else if (url.includes('/us/product/')) category = 'US Product Page';
        else if (url.includes('/brand/')) category = 'Brand Page';
        else if (url.includes('/blog/')) category = 'Blog Post';
        else if (url.includes('/us/')) category = 'US Page';
        else if (url.match(/\/[a-z-]+$/)) category = 'Location Page';
        else category = 'Static Page';
        
        csvReport.push(`${url},Unexpected,${lastIndexed},${category}`);
      });
    }

    // Write detailed report
    const reportPath = '/Users/solvifyab/Desktop/NP/missing-urls-detailed-report.csv';
    fs.writeFileSync(reportPath, csvReport.join('\n'));

    // Generate summary report
    const summaryReport = [
      'Category,Missing Count,Total Expected,Indexed Count',
      `Static Pages,${missingUrls.filter(url => !url.includes('/product/') && !url.includes('/brand/') && !url.includes('/blog/') && !url.includes('/us/') && !url.match(/\/[a-z-]+$/)).length},${expectedUrls.size - missingUrls.length},${indexedUrls.size - unexpectedUrls.length}`,
      `Product Pages,${missingUrls.filter(url => url.includes('/product/') && !url.includes('/us/')).length},${Array.from(expectedUrls).filter(url => url.includes('/product/') && !url.includes('/us/')).length},${Array.from(indexedUrls).filter(url => url.includes('/product/') && !url.includes('/us/')).length}`,
      `US Product Pages,${missingUrls.filter(url => url.includes('/us/product/')).length},${Array.from(expectedUrls).filter(url => url.includes('/us/product/')).length},${Array.from(indexedUrls).filter(url => url.includes('/us/product/')).length}`,
      `Brand Pages,${missingUrls.filter(url => url.includes('/brand/')).length},${Array.from(expectedUrls).filter(url => url.includes('/brand/')).length},${Array.from(indexedUrls).filter(url => url.includes('/brand/')).length}`,
      `Blog Posts,${missingUrls.filter(url => url.includes('/blog/')).length},${Array.from(expectedUrls).filter(url => url.includes('/blog/')).length},${Array.from(indexedUrls).filter(url => url.includes('/blog/')).length}`,
      `Location Pages,${missingUrls.filter(url => url.match(/\/[a-z-]+$/) && !url.includes('/us/')).length},${Array.from(expectedUrls).filter(url => url.match(/\/[a-z-]+$/) && !url.includes('/us/')).length},${Array.from(indexedUrls).filter(url => url.match(/\/[a-z-]+$/) && !url.includes('/us/')).length}`,
      `US Pages,${missingUrls.filter(url => url.includes('/us/') && !url.includes('/us/product/')).length},${Array.from(expectedUrls).filter(url => url.includes('/us/') && !url.includes('/us/product/')).length},${Array.from(indexedUrls).filter(url => url.includes('/us/') && !url.includes('/us/product/')).length}`,
      `TOTAL,${missingUrls.length},${expectedUrls.size},${indexedUrls.size}`
    ];

    const summaryPath = '/Users/solvifyab/Desktop/NP/indexing-summary-report.csv';
    fs.writeFileSync(summaryPath, summaryReport.join('\n'));

    console.log(`\nReports generated:`);
    console.log(`- Detailed report: ${reportPath}`);
    console.log(`- Summary report: ${summaryPath}`);
    console.log(`\nSummary:`);
    console.log(`- Missing URLs: ${missingUrls.length}`);
    console.log(`- Unexpected URLs: ${unexpectedUrls.length}`);
    console.log(`- Total indexed: ${indexedUrls.size}`);
    console.log(`- Total expected: ${expectedUrls.size}`);
    console.log(`- Indexing coverage: ${((indexedUrls.size - unexpectedUrls.length) / expectedUrls.size * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
