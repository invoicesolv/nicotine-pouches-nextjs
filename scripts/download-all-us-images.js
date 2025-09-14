const fs = require('fs');
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
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.log(`Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

function generateLocalImageUrl(productTitle, brand) {
  const cleanTitle = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  const cleanBrand = brand.toLowerCase();
  const filename = `${cleanTitle}_t_360.png`;
  return `/us-product-images/${filename}`;
}

async function downloadAllUSImages() {
  console.log('Downloading all US product images...');
  
  try {
    // Get all products from database
    const { data: products, error: fetchError } = await supabase
      .from('us_products')
      .select('id, product_title, brand, image_url');
    
    if (fetchError) throw fetchError;
    
    console.log(`Found ${products.length} products to process`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Process products in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const promises = batch.map(async (product) => {
        try {
          const filename = product.product_title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '_')
            .replace(/-/g, '_') + '_t_360.png';
          
          await downloadImage(product.image_url, filename);
          
          // Update database with local URL
          const localUrl = `/us-product-images/${filename}`;
          const { error: updateError } = await supabase
            .from('us_products')
            .update({ image_url: localUrl })
            .eq('id', product.id);
          
          if (updateError) {
            console.error(`Error updating ${product.product_title}:`, updateError);
          } else {
            console.log(`Updated ${product.product_title} with local URL`);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to process ${product.product_title}:`, error.message);
          failCount++;
        }
      });
      
      await Promise.all(promises);
      
      // Wait a bit between batches to be respectful
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\nDownload complete!`);
    console.log(`Success: ${successCount} images`);
    console.log(`Failed: ${failCount} images`);
    
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAllUSImages();
