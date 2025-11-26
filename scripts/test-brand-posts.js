const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrandPosts() {
  try {
    console.log('🔍 Testing brand posts functionality...\n');

    // Test the getProductsByBrand function logic
    const getProductsByBrand = async (brandName) => {
      try {
        const { data: products, error } = await supabase
          .from('wp_products')
          .select('*')
          .ilike('name', `${brandName}%`)
          .not('image_url', 'is', null)
          .limit(2);
        
        if (error) {
          console.error('Error fetching products by brand:', error);
          return [];
        }
        
        return products || [];
      } catch (error) {
        console.error('Error fetching products by brand:', error);
        return [];
      }
    };

    // Test with different brand names
    const testBrands = ['ZYN', 'Velo', 'Cuba', 'Iceberg', 'Coco'];
    
    for (const brand of testBrands) {
      console.log(`\n🔍 Testing brand: ${brand}`);
      const products = await getProductsByBrand(brand);
      
      if (products.length > 0) {
        console.log(`✅ Found ${products.length} products for ${brand}:`);
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name}`);
          console.log(`     Image: ${product.image_url ? '✅' : '❌'}`);
        });
      } else {
        console.log(`⚠️  No products found for ${brand}`);
      }
    }

    // Test with a brand that should definitely exist
    console.log(`\n🔍 Testing with 'Cuba' (should have products):`);
    const cubaProducts = await getProductsByBrand('Cuba');
    console.log(`✅ Cuba products found: ${cubaProducts.length}`);

    if (cubaProducts.length > 0) {
      console.log('Sample Cuba products:');
      cubaProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
      });
    }

    console.log('\n🎉 Brand posts functionality test completed!');

  } catch (error) {
    console.error('❌ Error testing brand posts:', error);
  }
}

testBrandPosts();
