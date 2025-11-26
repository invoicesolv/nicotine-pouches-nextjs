const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create images directory
const imagesDir = path.join(__dirname, '../extracted-products/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download image with retry and timeout
function downloadImage(url, filepath, retries = 3) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    
    const request = protocol.get(url, options, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve(filepath);
        });
        
        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete partial file
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Function to get file extension from URL
function getFileExtension(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname);
    return ext || '.jpg'; // Default to .jpg if no extension
  } catch (e) {
    return '.jpg';
  }
}

// Main function
async function downloadImages() {
  try {
    console.log('🚀 Starting image download process...');
    
    // Load the product data
    const dataFile = path.join(__dirname, '../extracted-products/wordpress_products_data.json');
    if (!fs.existsSync(dataFile)) {
      console.log('❌ Product data file not found. Run extract-products-data-only.js first.');
      return;
    }
    
    const products = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const productsWithImages = products.filter(p => p.image && p.image.original_url);
    
    console.log(`📦 Found ${productsWithImages.length} products with images to download`);
    
    let successCount = 0;
    let failCount = 0;
    const failedDownloads = [];
    
    // Process images in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < productsWithImages.length; i += batchSize) {
      const batch = productsWithImages.slice(i, i + batchSize);
      console.log(`\n📥 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(productsWithImages.length/batchSize)} (${batch.length} images)`);
      
      const batchPromises = batch.map(async (product) => {
        try {
          const ext = getFileExtension(product.image.original_url);
          const filename = `product_${product.id}${ext}`;
          const filepath = path.join(imagesDir, filename);
          
          // Skip if file already exists
          if (fs.existsSync(filepath)) {
            console.log(`⏭️ Skipping ${filename} (already exists)`);
            return { success: true, product };
          }
          
          await downloadImage(product.image.original_url, filepath);
          
          // Update the product data with local path
          product.image.local_path = filepath;
          product.image.filename = filename;
          
          return { success: true, product };
        } catch (error) {
          console.log(`❌ Failed to download image for product ${product.id}: ${error.message}`);
          failedDownloads.push({
            productId: product.id,
            productName: product.name,
            imageUrl: product.image.original_url,
            error: error.message
          });
          return { success: false, product };
        }
      });
      
      const results = await Promise.all(batchPromises);
      
      const batchSuccess = results.filter(r => r.success).length;
      const batchFail = results.filter(r => !r.success).length;
      
      successCount += batchSuccess;
      failCount += batchFail;
      
      console.log(`   ✅ Success: ${batchSuccess}, ❌ Failed: ${batchFail}`);
      
      // Small delay between batches
      if (i + batchSize < productsWithImages.length) {
        console.log('   ⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Update the JSON file with local paths
    console.log('\n💾 Updating product data with local image paths...');
    const updatedProducts = products.map(product => {
      if (product.image && product.image.local_path) {
        return product; // Already updated
      }
      return product;
    });
    
    fs.writeFileSync(dataFile, JSON.stringify(updatedProducts, null, 2));
    
    // Save failed downloads report
    if (failedDownloads.length > 0) {
      const failedFile = path.join(__dirname, '../extracted-products/failed_downloads.json');
      fs.writeFileSync(failedFile, JSON.stringify(failedDownloads, null, 2));
      console.log(`📄 Failed downloads saved to: ${failedFile}`);
    }
    
    // Create final summary
    const summary = {
      total_products: products.length,
      products_with_images: productsWithImages.length,
      successful_downloads: successCount,
      failed_downloads: failCount,
      success_rate: `${((successCount / productsWithImages.length) * 100).toFixed(1)}%`,
      download_date: new Date().toISOString(),
      images_directory: imagesDir
    };
    
    const summaryFile = path.join(__dirname, '../extracted-products/download_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 Image download process completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total products: ${summary.total_products}`);
    console.log(`   - Products with images: ${summary.products_with_images}`);
    console.log(`   - Successful downloads: ${summary.successful_downloads}`);
    console.log(`   - Failed downloads: ${summary.failed_downloads}`);
    console.log(`   - Success rate: ${summary.success_rate}`);
    console.log(`\n📁 Images saved to: ${imagesDir}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
downloadImages();
