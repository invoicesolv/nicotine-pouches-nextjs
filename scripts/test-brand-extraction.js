const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrandExtraction() {
  try {
    console.log('🔍 Testing brand extraction logic...\n');

    // Get some sample products
    const { data: products, error } = await supabase
      .from('wp_products')
      .select('name, image_url')
      .not('image_url', 'is', null)
      .limit(20);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Products fetched: ${products.length}\n`);

    // Test brand extraction
    const brandCounts = {};
    products.forEach((product) => {
      const brand = product.name.split(' ')[0].toLowerCase();
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    console.log('📊 Brand distribution:');
    Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} products`);
      });

    // Test specific brand filtering (like MegaMenu does)
    const testBrands = ['zyn', 'velo', '4nx', 'coco'];
    testBrands.forEach(brand => {
      const brandProducts = products.filter(product => {
        const dbBrand = product.name.split(' ')[0].toLowerCase().trim();
        return dbBrand === brand;
      });
      
      if (brandProducts.length > 0) {
        console.log(`\n✅ ${brand.toUpperCase()} products found: ${brandProducts.length}`);
        brandProducts.slice(0, 3).forEach(p => console.log(`  - ${p.name}`));
      } else {
        console.log(`\n⚠️  No ${brand.toUpperCase()} products found`);
      }
    });

    console.log('\n🎉 Brand extraction test completed!');

  } catch (error) {
    console.error('❌ Error testing brand extraction:', error);
  }
}

testBrandExtraction();
