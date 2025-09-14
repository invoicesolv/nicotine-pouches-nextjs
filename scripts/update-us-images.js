const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate real Prilla image URL
function generatePrillaImageUrl(productTitle, brand) {
  // Convert product title to Prilla's image naming convention
  const cleanTitle = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  const cleanBrand = brand.toLowerCase();
  
  // Prilla's image URL pattern
  return `https://prilla.com/media/catalog/product/cache/1f74410ad1047917b68b5f820981491a/${cleanBrand.charAt(0)}/${cleanBrand.charAt(1)}/${cleanTitle}_t_360.png`;
}

async function updateUSProductImages() {
  console.log('Updating US product images with real Prilla URLs...');
  
  try {
    // Get all products from database
    const { data: products, error: fetchError } = await supabase
      .from('us_products')
      .select('id, product_title, brand');
    
    if (fetchError) throw fetchError;
    
    console.log(`Found ${products.length} products to update`);
    
    // Update each product with real image URL
    for (const product of products) {
      const realImageUrl = generatePrillaImageUrl(product.product_title, product.brand);
      
      const { error: updateError } = await supabase
        .from('us_products')
        .update({ image_url: realImageUrl })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        console.log(`Updated ${product.product_title}: ${realImageUrl}`);
      }
    }
    
    console.log('Successfully updated all US product images!');
    
  } catch (error) {
    console.error('Error updating images:', error);
  }
}

updateUSProductImages();
