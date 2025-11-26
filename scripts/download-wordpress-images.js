const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

// WordPress database connection details
const wpConfig = {
  host: '35.197.229.176',
  port: 23012,
  user: 'user_13619',
  password: 'Miljonen1.se',
  database: 'app_13619_staging'
};

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/wordpress-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${path.basename(filepath)}`);
          resolve(filepath);
        });
      } else {
        console.log(`Failed to download ${url}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`Error downloading ${url}:`, err.message);
      reject(err);
    });
  });
}

// Function to get WordPress products via SSH
async function getWordPressProducts() {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const sshCommand = `ssh -p 23012 user_13619@35.197.229.176 "mysql -u app_13619_staging -p'{5xcOdP1Au4NNWE' app_13619_staging -e \"SELECT p.ID, p.post_title, pm.meta_value as image_url FROM wp_posts p LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id WHERE p.post_type = 'product' AND p.post_status = 'publish' AND pm.meta_key = '_thumbnail_id' ORDER BY p.ID;\""`;
    
    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('SSH Error:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error('SSH Stderr:', stderr);
      }
      
      // Parse the MySQL output
      const lines = stdout.trim().split('\n');
      const products = [];
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (line) {
          const parts = line.split('\t');
          if (parts.length >= 3) {
            products.push({
              id: parseInt(parts[0]),
              title: parts[1],
              thumbnail_id: parts[2]
            });
          }
        }
      }
      
      resolve(products);
    });
  });
}

// Function to get image URLs from WordPress
async function getImageUrls(thumbnailIds) {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const ids = thumbnailIds.join(',');
    const sshCommand = `ssh -p 23012 user_13619@35.197.229.176 "mysql -u app_13619_staging -p'{5xcOdP1Au4NNWE' app_13619_staging -e \"SELECT ID, guid FROM wp_posts WHERE ID IN (${ids}) AND post_type = 'attachment';\""`;
    
    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('SSH Error:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error('SSH Stderr:', stderr);
      }
      
      // Parse the MySQL output
      const lines = stdout.trim().split('\n');
      const images = {};
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (line) {
          const parts = line.split('\t');
          if (parts.length >= 2) {
            images[parseInt(parts[0])] = parts[1];
          }
        }
      }
      
      resolve(images);
    });
  });
}

// Main function
async function downloadWordPressImages() {
  try {
    console.log('🔍 Getting WordPress products...');
    const products = await getWordPressProducts();
    console.log(`Found ${products.length} products`);
    
    // Get unique thumbnail IDs
    const thumbnailIds = [...new Set(products.map(p => p.thumbnail_id).filter(Boolean))];
    console.log(`Found ${thumbnailIds.length} unique thumbnail IDs`);
    
    // Get image URLs
    console.log('🔍 Getting image URLs...');
    const imageUrls = await getImageUrls(thumbnailIds);
    console.log(`Found ${Object.keys(imageUrls).length} image URLs`);
    
    // Create mapping
    const productImageMap = {};
    products.forEach(product => {
      if (product.thumbnail_id && imageUrls[product.thumbnail_id]) {
        productImageMap[product.id] = imageUrls[product.thumbnail_id];
      }
    });
    
    console.log(`Mapped ${Object.keys(productImageMap).length} products to images`);
    
    // Download images
    console.log('📥 Downloading images...');
    const downloadPromises = [];
    const imageMapping = {};
    
    for (const [productId, imageUrl] of Object.entries(productImageMap)) {
      const filename = `product_${productId}.jpg`;
      const filepath = path.join(imagesDir, filename);
      
      // Store the mapping
      imageMapping[productId] = {
        original_url: imageUrl,
        local_path: filepath,
        filename: filename
      };
      
      downloadPromises.push(
        downloadImage(imageUrl, filepath).catch(err => {
          console.log(`Failed to download image for product ${productId}:`, err.message);
          return null;
        })
      );
    }
    
    // Wait for all downloads to complete
    await Promise.all(downloadPromises);
    
    // Save mapping to file
    const mappingFile = path.join(__dirname, '../wordpress_image_mapping.json');
    fs.writeFileSync(mappingFile, JSON.stringify(imageMapping, null, 2));
    console.log(`💾 Saved image mapping to ${mappingFile}`);
    
    // Update Supabase with new image URLs
    console.log('🔄 Updating Supabase with new image URLs...');
    const updatePromises = [];
    
    for (const [productId, imageData] of Object.entries(imageMapping)) {
      if (imageData.local_path && fs.existsSync(imageData.local_path)) {
        // Upload to Supabase storage
        const fileBuffer = fs.readFileSync(imageData.local_path);
        const fileName = `wordpress-images/${imageData.filename}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (uploadError) {
          console.log(`Failed to upload ${fileName}:`, uploadError.message);
        } else {
          const publicUrl = supabase.storage
            .from('blog-images')
            .getPublicUrl(fileName).data.publicUrl;
          
          // Update product in database
          const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: publicUrl })
            .eq('id', parseInt(productId));
          
          if (updateError) {
            console.log(`Failed to update product ${productId}:`, updateError.message);
          } else {
            console.log(`✅ Updated product ${productId} with new image`);
          }
        }
      }
    }
    
    console.log('🎉 WordPress image download and update completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
downloadWordPressImages();
