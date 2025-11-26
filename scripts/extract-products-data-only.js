const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// WordPress database connection details
const wpConfig = {
  host: '35.197.229.176',
  port: 23012,
  user: 'user_13619',
  password: 'Miljonen1.se',
  database: 'app_13619_staging'
};

// Create output directory
const outputDir = path.join(__dirname, '../extracted-products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to run SSH command
function runSSHCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('SSH Error:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error('SSH Stderr:', stderr);
      }
      
      resolve(stdout);
    });
  });
}

// Function to get all products with their data
async function getAllProducts() {
  console.log('🔍 Getting all WordPress products...');
  
  const command = `sshpass -p "Miljonen1.se" ssh -p 23012 user_13619@35.197.229.176 "mysql -u app_13619_staging -p'{5xcOdP1Au4NNWE' app_13619_staging -e \\"SELECT p.ID, p.post_title, p.post_content, p.post_excerpt, p.post_status, p.post_type FROM wp_posts p WHERE p.post_type = 'product' AND p.post_status = 'publish' ORDER BY p.ID;\\""`;
  
  const output = await runSSHCommand(command);
  const lines = output.trim().split('\n');
  const products = [];
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (line) {
      const parts = line.split('\t');
      if (parts.length >= 6) {
        products.push({
          id: parseInt(parts[0]),
          title: parts[1],
          content: parts[2],
          excerpt: parts[3],
          status: parts[4],
          type: parts[5]
        });
      }
    }
  }
  
  console.log(`📦 Found ${products.length} products`);
  return products;
}

// Function to get product images
async function getProductImages(productIds) {
  console.log('🔍 Getting product images...');
  
  if (productIds.length === 0) {
    return {};
  }
  
  const ids = productIds.join(',');
  const command = `sshpass -p "Miljonen1.se" ssh -p 23012 user_13619@35.197.229.176 "mysql -u app_13619_staging -p'{5xcOdP1Au4NNWE' app_13619_staging -e \\"SELECT p.ID, pm.meta_value as thumbnail_id FROM wp_posts p LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id WHERE p.ID IN (${ids}) AND pm.meta_key = '_thumbnail_id';\\""`;
  
  const output = await runSSHCommand(command);
  const lines = output.trim().split('\n');
  const productThumbnails = {};
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (line) {
      const parts = line.split('\t');
      if (parts.length >= 2 && parts[1]) {
        productThumbnails[parseInt(parts[0])] = parseInt(parts[1]);
      }
    }
  }
  
  // Get image URLs for thumbnail IDs
  const thumbnailIds = Object.values(productThumbnails);
  if (thumbnailIds.length === 0) {
    return {};
  }
  
  const imageIds = thumbnailIds.join(',');
  const imageCommand = `sshpass -p "Miljonen1.se" ssh -p 23012 user_13619@35.197.229.176 "mysql -u app_13619_staging -p'{5xcOdP1Au4NNWE' app_13619_staging -e \\"SELECT ID, guid, post_title FROM wp_posts WHERE ID IN (${imageIds}) AND post_type = 'attachment';\\""`;
  
  const imageOutput = await runSSHCommand(imageCommand);
  const imageLines = imageOutput.trim().split('\n');
  const imageUrls = {};
  
  for (let i = 1; i < imageLines.length; i++) { // Skip header
    const line = imageLines[i].trim();
    if (line) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        imageUrls[parseInt(parts[0])] = {
          url: parts[1],
          title: parts[2] || ''
        };
      }
    }
  }
  
  // Map products to their image URLs
  const productImages = {};
  for (const [productId, thumbnailId] of Object.entries(productThumbnails)) {
    if (imageUrls[thumbnailId]) {
      productImages[productId] = imageUrls[thumbnailId];
    }
  }
  
  console.log(`🖼️ Found ${Object.keys(productImages).length} products with images`);
  return productImages;
}

// Function to get product meta data (price, SKU, etc.)
async function getProductMeta(productIds) {
  console.log('🔍 Getting product meta data...');
  
  if (productIds.length === 0) {
    return {};
  }
  
  const ids = productIds.join(',');
  const command = `sshpass -p "Miljonen1.se" ssh -p 23012 user_13619@35.197.229.176 "mysql -u app_13619_staging -p'{5xcOdP1Au4NNWE' app_13619_staging -e \\"SELECT post_id, meta_key, meta_value FROM wp_postmeta WHERE post_id IN (${ids}) AND meta_key IN ('_price', '_regular_price', '_sale_price', '_sku', '_stock_status', '_manage_stock', '_stock', '_weight', '_length', '_width', '_height');\\""`;
  
  const output = await runSSHCommand(command);
  const lines = output.trim().split('\n');
  const productMeta = {};
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (line) {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const postId = parseInt(parts[0]);
        const metaKey = parts[1];
        const metaValue = parts[2];
        
        if (!productMeta[postId]) {
          productMeta[postId] = {};
        }
        
        productMeta[postId][metaKey] = metaValue;
      }
    }
  }
  
  console.log(`📊 Found meta data for ${Object.keys(productMeta).length} products`);
  return productMeta;
}

// Main function
async function extractProductsData() {
  try {
    console.log('🚀 Starting WordPress product data extraction...');
    
    // Get all products
    const products = await getAllProducts();
    if (products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const productIds = products.map(p => p.id);
    
    // Get product images and meta data in parallel
    const [productImages, productMeta] = await Promise.all([
      getProductImages(productIds),
      getProductMeta(productIds)
    ]);
    
    // Combine all data
    const enrichedProducts = products.map(product => {
      const productId = product.id;
      const imageData = productImages[productId];
      const meta = productMeta[productId] || {};
      
      return {
        id: productId,
        name: product.title,
        content: product.content,
        excerpt: product.excerpt,
        status: product.status,
        type: product.type,
        image: imageData ? {
          original_url: imageData.url,
          title: imageData.title,
          filename: `product_${productId}.jpg` // Suggested filename for later download
        } : null,
        meta: {
          price: meta._price || meta._regular_price || '0',
          sale_price: meta._sale_price || null,
          sku: meta._sku || null,
          stock_status: meta._stock_status || 'instock',
          manage_stock: meta._manage_stock || 'no',
          stock: meta._stock || null,
          weight: meta._weight || null,
          dimensions: {
            length: meta._length || null,
            width: meta._width || null,
            height: meta._height || null
          }
        }
      };
    });
    
    console.log(`📝 Enriched ${enrichedProducts.length} products with meta data`);
    
    // Save the complete product data
    const outputFile = path.join(outputDir, 'wordpress_products_data.json');
    fs.writeFileSync(outputFile, JSON.stringify(enrichedProducts, null, 2));
    
    // Save a simplified CSV for easy viewing
    const csvFile = path.join(outputDir, 'wordpress_products_data.csv');
    const csvHeader = 'ID,Name,Price,Sale Price,SKU,Stock Status,Image URL,Image Title\n';
    const csvRows = enrichedProducts.map(p => {
      const imageUrl = p.image ? p.image.original_url : '';
      const imageTitle = p.image ? p.image.title : '';
      return `${p.id},"${p.name}","${p.meta.price}","${p.meta.sale_price || ''}","${p.meta.sku || ''}","${p.meta.stock_status}","${imageUrl}","${imageTitle}"`;
    }).join('\n');
    
    fs.writeFileSync(csvFile, csvHeader + csvRows);
    
    // Create a summary
    const summary = {
      total_products: enrichedProducts.length,
      products_with_images: enrichedProducts.filter(p => p.image).length,
      products_without_images: enrichedProducts.filter(p => !p.image).length,
      extraction_date: new Date().toISOString(),
      output_files: {
        json: outputFile,
        csv: csvFile
      }
    };
    
    const summaryFile = path.join(outputDir, 'extraction_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 WordPress product data extraction completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total products: ${summary.total_products}`);
    console.log(`   - Products with images: ${summary.products_with_images}`);
    console.log(`   - Products without images: ${summary.products_without_images}`);
    console.log(`\n📁 Output files:`);
    console.log(`   - JSON: ${outputFile}`);
    console.log(`   - CSV: ${csvFile}`);
    console.log(`   - Summary: ${summaryFile}`);
    
    // Show sample of products with images
    const productsWithImages = enrichedProducts.filter(p => p.image).slice(0, 5);
    if (productsWithImages.length > 0) {
      console.log('\n📋 Sample products with images:');
      productsWithImages.forEach(p => {
        console.log(`   - ${p.id}: ${p.name} (${p.image.original_url})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
extractProductsData();
