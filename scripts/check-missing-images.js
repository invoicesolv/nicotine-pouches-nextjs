const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingImages() {
  console.log('Checking for missing images...');
  
  try {
    // Get all products from database
    const { data: products, error } = await supabase
      .from('us_products')
      .select('product_title, image_url');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products.length} products in database`);
    
    // Get list of downloaded images
    const imageDir = path.join(__dirname, '../public/us-product-images');
    const downloadedFiles = fs.readdirSync(imageDir);
    console.log(`Found ${downloadedFiles.length} downloaded images`);
    
    // Check which images are missing
    const missingImages = [];
    
    for (const product of products) {
      if (product.image_url && product.image_url.startsWith('/us-product-images/')) {
        const filename = path.basename(product.image_url);
        if (!downloadedFiles.includes(filename)) {
          missingImages.push({
            product: product.product_title,
            filename: filename,
            image_url: product.image_url
          });
        }
      }
    }
    
    console.log(`\nMissing images: ${missingImages.length}`);
    missingImages.forEach(img => {
      console.log(`- ${img.product}: ${img.filename}`);
    });
    
    // Check for empty files (0 bytes)
    const emptyFiles = [];
    for (const file of downloadedFiles) {
      const filePath = path.join(imageDir, file);
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        emptyFiles.push(file);
      }
    }
    
    if (emptyFiles.length > 0) {
      console.log(`\nEmpty files (0 bytes): ${emptyFiles.length}`);
      emptyFiles.forEach(file => {
        console.log(`- ${file}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMissingImages();
