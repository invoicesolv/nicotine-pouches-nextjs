const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the CSV file
const csvPath = '/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/buy-zyn-wintergreen-6mg---order-online---save-up-to-14----prilla-com-2025-09-12T09-53-56-330Z.csv';
const outputDir = '/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/public/us-product-images';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const filePath = path.join(outputDir, filename);
      const fileStream = fs.createWriteStream(filePath);
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve(filePath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

// Function to create filename from product name
function createFilename(productName) {
  return productName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_t_360.png';
}

// Read and process CSV
fs.readFile(csvPath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }
  
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  
  console.log('Headers:', headers);
  
  const products = [];
  const downloadPromises = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',');
    
    if (values.length >= 4) {
      const pageUrl = values[0];
      const productName = values[1];
      const imageUrl = values[2];
      const description = values[3];
      
      if (imageUrl && imageUrl.startsWith('http')) {
        const filename = createFilename(productName);
        products.push({
          pageUrl,
          productName,
          imageUrl,
          description,
          filename
        });
        
        // Download image
        downloadPromises.push(
          downloadImage(imageUrl, filename)
            .catch(err => console.error(`Failed to download ${productName}:`, err.message))
        );
      }
    }
  }
  
  console.log(`Found ${products.length} products with images`);
  
  // Wait for all downloads to complete
  try {
    await Promise.all(downloadPromises);
    console.log('All downloads completed');
    
    // Save product data to JSON for database import
    const productData = products.map(product => ({
      product_title: product.productName,
      brand: 'ZYN',
      flavour: product.productName.split(' ').slice(1).join(' ').replace(/\d+mg/, '').trim(),
      strength: product.productName.match(/\d+mg/)?.[0] || '6mg',
      format: 'Slim',
      nicotine_mg_pouch: product.productName.match(/\d+mg/)?.[0] || '6mg',
      td_element: 'ZYN',
      description: product.description,
      page_url: product.pageUrl,
      image_url: `/us-product-images/${product.filename}`
    }));
    
    fs.writeFileSync(
      '/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/zyn_products_data.json',
      JSON.stringify(productData, null, 2)
    );
    
    console.log('Product data saved to zyn_products_data.json');
    
  } catch (error) {
    console.error('Error during downloads:', error);
  }
});
