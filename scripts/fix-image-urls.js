const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateLocalImageUrl(productTitle, brand) {
  const cleanTitle = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
  
  const filename = `${cleanTitle}_t_360.png`;
  return `/us-product-images/${filename}`;
}

async function fixImageUrls() {
  console.log('Fixing image URLs to use local paths...');
  
  try {
    // Get all products that still have external URLs
    const { data: products, error: fetchError } = await supabase
      .from('us_products')
      .select('id, product_title, brand, image_url')
      .like('image_url', 'https://prilla.com%');
    
    if (fetchError) throw fetchError;
    
    console.log(`Found ${products.length} products with external URLs to fix`);
    
    for (const product of products) {
      const localUrl = generateLocalImageUrl(product.product_title, product.brand);
      
      const { error: updateError } = await supabase
        .from('us_products')
        .update({ image_url: localUrl })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating ${product.product_title}:`, updateError);
      } else {
        console.log(`Updated ${product.product_title}: ${localUrl}`);
      }
    }
    
    console.log('Successfully updated all image URLs!');
    
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  }
}

fixImageUrls();
