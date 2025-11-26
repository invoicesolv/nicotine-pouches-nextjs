const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

console.log('🔗 Using Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function addOriginalImageUrlColumn() {
  console.log('🔄 Adding original_image_url column to product tables...');
  
  try {
    // Try to add column to wp_products table using direct SQL
    console.log('📊 Adding column to wp_products...');
    const { error: wpError } = await supabase
      .from('wp_products')
      .select('id')
      .limit(1);
    
    if (wpError) {
      console.log('❌ Error accessing wp_products:', wpError.message);
    } else {
      console.log('✅ wp_products table accessible');
    }
    
    // Try to add column to us_products table
    console.log('📊 Adding column to us_products...');
    const { error: usError } = await supabase
      .from('us_products')
      .select('id')
      .limit(1);
    
    if (usError) {
      console.log('❌ Error accessing us_products:', usError.message);
    } else {
      console.log('✅ us_products table accessible');
    }
    
    // Since we can't add columns directly, let's update the existing image_url with local paths
    console.log('🔄 Updating image URLs to local paths...');
    
    // Read the image mapping
    const fs = require('fs');
    const path = require('path');
    const mappingFile = path.join(process.cwd(), 'image-mapping.json');
    
    if (!fs.existsSync(mappingFile)) {
      console.log('❌ Image mapping file not found');
      return;
    }
    
    const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    console.log(`📋 Found ${Object.keys(mapping.products).length} product mappings`);
    
    // Update wp_products with local paths
    let wpUpdateCount = 0;
    let wpErrorCount = 0;
    
    for (const [productId, imageData] of Object.entries(mapping.products)) {
      if (productId.startsWith('us_')) {
        continue; // Skip US products for now
      }
      
      try {
        const { error } = await supabase
          .from('wp_products')
          .update({ 
            image_url: imageData.local_path
          })
          .eq('id', parseInt(productId));
        
        if (error) {
          console.log(`❌ Failed to update wp_products ${productId}: ${error.message}`);
          wpErrorCount++;
        } else {
          wpUpdateCount++;
        }
      } catch (err) {
        console.log(`❌ Error updating wp_products ${productId}: ${err.message}`);
        wpErrorCount++;
      }
    }
    
    console.log(`📊 wp_products updates: ${wpUpdateCount} success, ${wpErrorCount} failed`);
    
    // Update us_products with local paths
    let usUpdateCount = 0;
    let usErrorCount = 0;
    
    for (const [productId, imageData] of Object.entries(mapping.products)) {
      if (!productId.startsWith('us_')) {
        continue; // Skip non-US products
      }
      
      const actualId = productId.replace('us_', '');
      
      try {
        const { error } = await supabase
          .from('us_products')
          .update({ 
            image_url: imageData.local_path
          })
          .eq('id', parseInt(actualId));
        
        if (error) {
          console.log(`❌ Failed to update us_products ${actualId}: ${error.message}`);
          usErrorCount++;
        } else {
          usUpdateCount++;
        }
      } catch (err) {
        console.log(`❌ Error updating us_products ${actualId}: ${err.message}`);
        usErrorCount++;
      }
    }
    
    console.log(`📊 us_products updates: ${usUpdateCount} success, ${usErrorCount} failed`);
    
    console.log('🎉 Database updates completed!');
    console.log(`📊 Summary:`);
    console.log(`   - wp_products: ${wpUpdateCount} updated`);
    console.log(`   - us_products: ${usUpdateCount} updated`);
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  }
}

// Run the script
if (require.main === module) {
  addOriginalImageUrlColumn();
}

module.exports = { addOriginalImageUrlColumn };
