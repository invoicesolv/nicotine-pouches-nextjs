const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to transform WordPress product data for Supabase
function transformProductData(wpProduct) {
  return {
    id: wpProduct.id, // WordPress product ID
    name: wpProduct.name,
    content: wpProduct.content || null,
    excerpt: wpProduct.excerpt || null,
    status: wpProduct.status || 'publish',
    type: wpProduct.type || 'product',
    
    // Image data
    image_url: wpProduct.image?.original_url || null,
    image_title: wpProduct.image?.title || null,
    image_filename: wpProduct.image?.filename || null,
    image_local_path: wpProduct.image?.local_path || null,
    
    // Product metadata
    price: parseFloat(wpProduct.meta?.price) || 0,
    sale_price: wpProduct.meta?.sale_price ? parseFloat(wpProduct.meta.sale_price) : null,
    sku: wpProduct.meta?.sku || null,
    stock_status: wpProduct.meta?.stock_status || 'instock',
    manage_stock: wpProduct.meta?.manage_stock || 'no',
    stock: wpProduct.meta?.stock && wpProduct.meta.stock !== 'NULL' ? parseInt(wpProduct.meta.stock) : null,
    weight: wpProduct.meta?.weight ? parseFloat(wpProduct.meta.weight) : null,
    
    // Dimensions
    length: wpProduct.meta?.dimensions?.length ? parseFloat(wpProduct.meta.dimensions.length) : null,
    width: wpProduct.meta?.dimensions?.width ? parseFloat(wpProduct.meta.dimensions.width) : null,
    height: wpProduct.meta?.dimensions?.height ? parseFloat(wpProduct.meta.dimensions.height) : null
  };
}

// Function to upload images to Supabase Storage
async function uploadImageToSupabase(localPath, filename) {
  try {
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️ Image file not found: ${localPath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const storagePath = `wordpress-products/${filename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.log(`❌ Failed to upload ${filename}:`, uploadError.message);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(storagePath);
    
    console.log(`✅ Uploaded image: ${filename}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.log(`❌ Error uploading ${filename}:`, error.message);
    return null;
  }
}

// Function to import products in batches
async function importProducts(products, batchSize = 50) {
  console.log(`🚀 Starting import of ${products.length} products...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Process in batches
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);
    
    // Transform products for this batch
    const transformedProducts = batch.map(transformProductData);
    
    // Upload images for products that have them
    for (const product of transformedProducts) {
      if (product.image_local_path && product.image_filename) {
        const publicUrl = await uploadImageToSupabase(product.image_local_path, product.image_filename);
        if (publicUrl) {
          product.image_url = publicUrl;
        }
      }
    }
    
    // Insert batch into Supabase
    const { data, error } = await supabase
      .from('wp_products')
      .upsert(transformedProducts, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.log(`❌ Batch ${batchNumber} failed:`, error.message);
      errorCount += batch.length;
      errors.push({
        batch: batchNumber,
        error: error.message,
        products: batch.map(p => p.id)
      });
    } else {
      console.log(`✅ Batch ${batchNumber} imported successfully`);
      successCount += batch.length;
    }
    
    // Small delay between batches
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { successCount, errorCount, errors };
}

// Function to verify import
async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  const { data: count, error: countError } = await supabase
    .from('wp_products')
    .select('id', { count: 'exact', head: true });
  
  if (countError) {
    console.log('❌ Error getting count:', countError.message);
    return;
  }
  
  console.log(`📊 Total products in database: ${count}`);
  
  // Check for products with images
  const { data: withImages, error: imagesError } = await supabase
    .from('wp_products')
    .select('id', { count: 'exact', head: true })
    .not('image_url', 'is', null);
  
  if (imagesError) {
    console.log('❌ Error getting image count:', imagesError.message);
  } else {
    console.log(`🖼️ Products with images: ${withImages}`);
  }
  
  // Show sample products
  const { data: sampleProducts, error: sampleError } = await supabase
    .from('wp_products')
    .select('id, name, sku, price, image_url')
    .limit(5);
  
  if (sampleError) {
    console.log('❌ Error getting sample products:', sampleError.message);
  } else {
    console.log('\n📋 Sample products:');
    sampleProducts.forEach(product => {
      console.log(`   - ${product.id}: ${product.name} (SKU: ${product.sku}, Price: ${product.price})`);
    });
  }
}

// Main function
async function importWordPressProducts() {
  try {
    console.log('🚀 Starting WordPress products import to Supabase...');
    
    // Load the extracted products data
    const dataFile = path.join(__dirname, '../extracted-products/wordpress_products_data.json');
    if (!fs.existsSync(dataFile)) {
      console.log('❌ Product data file not found. Run extract-products-data-only.js first.');
      return;
    }
    
    const products = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📦 Loaded ${products.length} products from extracted data`);
    
    // Import products
    const { successCount, errorCount, errors } = await importProducts(products);
    
    // Verify import
    await verifyImport();
    
    // Summary
    console.log('\n🎉 Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total products: ${products.length}`);
    console.log(`   - Successfully imported: ${successCount}`);
    console.log(`   - Failed: ${errorCount}`);
    console.log(`   - Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => {
        console.log(`   - Batch ${error.batch}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
importWordPressProducts();
