const fs = require('fs');
const csv = require('csv-parser');
const https = require('https');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Create directory if it doesn't exist
const imageDir = path.join(__dirname, '../public/us-product-images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(imageDir, filename));
    
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`Redirecting from ${url} to ${redirectUrl}`);
        return downloadImage(redirectUrl, filename).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(path.join(imageDir, filename), () => {}); // Delete the file on error
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function generateImageUrl(productTitle, brand) {
  // Convert product title to Prilla's image naming convention
  const cleanTitle = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  const cleanBrand = brand.toLowerCase();
  
  // Try different Prilla image URL patterns
  const patterns = [
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanBrand.charAt(0)}/${cleanBrand.charAt(1)}/${cleanTitle}_t_360.png`,
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanBrand.charAt(0)}/${cleanBrand.charAt(0)}/${cleanTitle}_t_360.png`,
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanTitle}_t_360.png`
  ];
  
  return patterns[0]; // Use the first pattern for now
}

async function scrapeRealImages() {
  console.log('Scraping real product images from Prilla.com...');
  
  const products = [];
  
  // Read CSV and extract product URLs
  fs.createReadStream('buy-2one-chewy-watermelon-8mg---order-online---save-up-to-19----prilla-com-2025-09-11T19-48-11-943Z.csv')
    .pipe(csv())
    .on('data', (row) => {
      products.push({
        title: row['Product Title'],
        brand: row.Brand,
        pageUrl: row['PAGE URL']
      });
    })
    .on('end', async () => {
      console.log(`Found ${products.length} products to process`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const filename = `${product.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '_').replace(/-/g, '_')}_t_360.png`;
        
        try {
          // Try to download the image
          const imageUrl = generateImageUrl(product.title, product.brand);
          await downloadImage(imageUrl, filename);
          
          // Update database with local URL
          const { error } = await supabase
            .from('us_products')
            .update({ image_url: `/us-product-images/${filename}` })
            .eq('product_title', product.title);
          
          if (error) {
            console.log(`Database update failed for ${product.title}:`, error.message);
          } else {
            console.log(`✓ Downloaded: ${product.title}`);
            successCount++;
          }
          
        } catch (error) {
          console.log(`✗ Failed: ${product.title} - ${error.message}`);
          failCount++;
        }
        
        // Add delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`\nCompleted! Success: ${successCount}, Failed: ${failCount}`);
    });
}

scrapeRealImages();
