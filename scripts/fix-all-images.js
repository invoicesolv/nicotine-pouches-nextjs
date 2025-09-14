const fs = require('fs');
const path = require('path');
const https = require('https');
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

function generateBetterImageUrl(productTitle, brand) {
  const cleanTitle = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  const cleanBrand = brand.toLowerCase();
  
  // Try multiple Prilla image URL patterns
  const patterns = [
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanBrand.charAt(0)}/${cleanBrand.charAt(1)}/${cleanTitle}_t_360.png`,
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanBrand.charAt(0)}/${cleanBrand.charAt(0)}/${cleanTitle}_t_360.png`,
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanTitle}_t_360.png`,
    `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanBrand}/${cleanTitle}_t_360.png`
  ];
  
  return patterns[0];
}

async function fixAllImages() {
  console.log('Fixing all product images...');
  
  try {
    // Get all products from database
    const { data: products, error } = await supabase
      .from('us_products')
      .select('product_title, brand, image_url');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products.length} products to process`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const product of products) {
      const filename = `${product.product_title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '_').replace(/-/g, '_')}_t_360.png`;
      const filePath = path.join(imageDir, filename);
      
      try {
        // Check if file exists and is large enough (>5KB)
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 5000) {
            console.log(`✓ Skipping ${product.product_title} (already has good image)`);
            continue;
          }
        }
        
        // Try to download a better image
        const imageUrl = generateBetterImageUrl(product.product_title, product.brand);
        await downloadImage(imageUrl, filename);
        
        // Check if the new image is better
        const newStats = fs.statSync(filePath);
        if (newStats.size > 5000) {
          // Update database with local URL
          const { error: updateError } = await supabase
            .from('us_products')
            .update({ image_url: `/us-product-images/${filename}` })
            .eq('product_title', product.product_title);
          
          if (updateError) {
            console.log(`Database update failed for ${product.product_title}:`, updateError.message);
          } else {
            console.log(`✓ Fixed: ${product.product_title} (${newStats.size} bytes)`);
            successCount++;
          }
        } else {
          console.log(`✗ Still small image for ${product.product_title} (${newStats.size} bytes)`);
          failCount++;
        }
        
      } catch (error) {
        console.log(`✗ Failed: ${product.product_title} - ${error.message}`);
        failCount++;
      }
      
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\nCompleted! Success: ${successCount}, Failed: ${failCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAllImages();
