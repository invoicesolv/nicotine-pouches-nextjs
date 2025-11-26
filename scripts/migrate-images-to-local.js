const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

console.log('🔗 Using Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Create uploads directories
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const productsDir = path.join(uploadsDir, 'products');
const blogImagesDir = path.join(uploadsDir, 'blog-images');
const vendorLogosDir = path.join(uploadsDir, 'vendor-logos');

// Ensure directories exist
[uploadsDir, productsDir, blogImagesDir, vendorLogosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Image mapping to track relationships
const imageMapping = {
  products: {},
  blogImages: {},
  vendorLogos: {}
};

// Download image from URL
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filePath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

// Generate filename from URL or product data
function generateFilename(url, productId, productName) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const extension = path.extname(pathname) || '.jpg';
  
  // Clean product name for filename
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  return `product_${productId}_${cleanName}${extension}`;
}

// Migrate product images
async function migrateProductImages() {
  console.log('🔄 Migrating product images...');
  
  try {
    // Get all products with images
    const { data: products, error } = await supabase
      .from('wp_products')
      .select('id, name, image_url')
      .not('image_url', 'is', null);
    
    if (error) throw error;
    
    console.log(`📦 Found ${products.length} products with images`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const product of products) {
      try {
        const filename = generateFilename(product.image_url, product.id, product.name);
        const localPath = path.join(productsDir, filename);
        
        // Skip if already exists
        if (fs.existsSync(localPath)) {
          console.log(`⏭️  Skipping ${product.name} (already exists)`);
          imageMapping.products[product.id] = {
            original_url: product.image_url,
            local_path: `/uploads/products/${filename}`,
            filename: filename
          };
          successCount++;
          continue;
        }
        
        // Download image
        await downloadImage(product.image_url, localPath);
        
        // Verify file was created and has content
        const stats = fs.statSync(localPath);
        if (stats.size > 0) {
          imageMapping.products[product.id] = {
            original_url: product.image_url,
            local_path: `/uploads/products/${filename}`,
            filename: filename
          };
          console.log(`✅ Downloaded: ${product.name} -> ${filename}`);
          successCount++;
        } else {
          throw new Error('Downloaded file is empty');
        }
        
      } catch (error) {
        console.log(`❌ Failed to download ${product.name}: ${error.message}`);
        failCount++;
      }
    }
    
    console.log(`📊 Product images: ${successCount} success, ${failCount} failed`);
    
  } catch (error) {
    console.error('❌ Error migrating product images:', error);
  }
}

// Migrate US product images
async function migrateUSProductImages() {
  console.log('🔄 Migrating US product images...');
  
  try {
    const { data: products, error } = await supabase
      .from('us_products')
      .select('id, product_title, image_url')
      .not('image_url', 'is', null);
    
    if (error) throw error;
    
    console.log(`📦 Found ${products.length} US products with images`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const product of products) {
      try {
        const filename = generateFilename(product.image_url, product.id, product.product_title);
        const localPath = path.join(productsDir, filename);
        
        // Skip if already exists
        if (fs.existsSync(localPath)) {
          console.log(`⏭️  Skipping ${product.product_title} (already exists)`);
          imageMapping.products[`us_${product.id}`] = {
            original_url: product.image_url,
            local_path: `/uploads/products/${filename}`,
            filename: filename
          };
          successCount++;
          continue;
        }
        
        // Download image
        await downloadImage(product.image_url, localPath);
        
        // Verify file was created and has content
        const stats = fs.statSync(localPath);
        if (stats.size > 0) {
          imageMapping.products[`us_${product.id}`] = {
            original_url: product.image_url,
            local_path: `/uploads/products/${filename}`,
            filename: filename
          };
          console.log(`✅ Downloaded: ${product.product_title} -> ${filename}`);
          successCount++;
        } else {
          throw new Error('Downloaded file is empty');
        }
        
      } catch (error) {
        console.log(`❌ Failed to download ${product.product_title}: ${error.message}`);
        failCount++;
      }
    }
    
    console.log(`📊 US Product images: ${successCount} success, ${failCount} failed`);
    
  } catch (error) {
    console.error('❌ Error migrating US product images:', error);
  }
}

// Update database with local image paths
async function updateDatabaseWithLocalPaths() {
  console.log('🔄 Updating database with local image paths...');
  
  try {
    // Update wp_products
    for (const [productId, imageData] of Object.entries(imageMapping.products)) {
      if (productId.startsWith('us_')) {
        // Skip US products for now, handle separately
        continue;
      }
      
      const { error } = await supabase
        .from('wp_products')
        .update({ 
          image_url: imageData.local_path,
          original_image_url: imageData.original_url // Store original URL for reference
        })
        .eq('id', parseInt(productId));
      
      if (error) {
        console.log(`❌ Failed to update product ${productId}: ${error.message}`);
      } else {
        console.log(`✅ Updated product ${productId} with local path`);
      }
    }
    
    // Update us_products
    for (const [productId, imageData] of Object.entries(imageMapping.products)) {
      if (!productId.startsWith('us_')) {
        continue;
      }
      
      const actualId = productId.replace('us_', '');
      const { error } = await supabase
        .from('us_products')
        .update({ 
          image_url: imageData.local_path,
          original_image_url: imageData.original_url
        })
        .eq('id', parseInt(actualId));
      
      if (error) {
        console.log(`❌ Failed to update US product ${actualId}: ${error.message}`);
      } else {
        console.log(`✅ Updated US product ${actualId} with local path`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  }
}

// Save image mapping to JSON file
function saveImageMapping() {
  const mappingFile = path.join(process.cwd(), 'image-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(imageMapping, null, 2));
  console.log(`💾 Saved image mapping to ${mappingFile}`);
}

// Main migration function
async function migrateImagesToLocal() {
  console.log('🚀 Starting image migration to local storage...');
  console.log('📁 Upload directories created');
  
  try {
    // Migrate all product images
    await migrateProductImages();
    await migrateUSProductImages();
    
    // Update database with local paths
    await updateDatabaseWithLocalPaths();
    
    // Save mapping for reference
    saveImageMapping();
    
    console.log('🎉 Image migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Products migrated: ${Object.keys(imageMapping.products).length}`);
    console.log(`   - Local storage: ${uploadsDir}`);
    console.log(`   - Mapping file: image-mapping.json`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
if (require.main === module) {
  migrateImagesToLocal();
}

module.exports = { migrateImagesToLocal };
