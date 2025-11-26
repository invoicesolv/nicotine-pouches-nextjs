const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMegaMenuData() {
  try {
    console.log('🔍 Testing MegaMenu data fetch...\n');

    // Test the same query that MegaMenu uses
    const { data: products, error } = await supabase
      .from('wp_products')
      .select('name, image_url')
      .not('image_url', 'is', null)
      .limit(200);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Products fetched: ${products.length}`);

    // Test brand extraction logic
    const imageMap = {};
    const productMap = {};
    
    products.forEach((product) => {
      // Extract brand from product name (first word)
      const brand = product.name.split(' ')[0].toLowerCase();
      
      // Create a key for each brand and product name
      const key = `${brand}-${product.name}`;
      imageMap[key] = product.image_url;
      productMap[key] = product;
      
      // Also create a mapping for brand only (for fallback)
      if (!imageMap[brand]) {
        imageMap[brand] = product.image_url;
      }
    });

    console.log(`✅ Image mappings created: ${Object.keys(imageMap).length}`);
    console.log(`✅ Product mappings created: ${Object.keys(productMap).length}`);

    // Test specific brand mappings
    const testBrands = ['zyn', 'velo', '4nx'];
    testBrands.forEach(brand => {
      if (imageMap[brand]) {
        console.log(`✅ ${brand} brand mapping found: ${imageMap[brand]}`);
      } else {
        console.log(`⚠️  ${brand} brand mapping not found`);
      }
    });

    console.log('\n🎉 MegaMenu data fetch test passed!');

  } catch (error) {
    console.error('❌ Error testing MegaMenu data:', error);
  }
}

testMegaMenuData();
