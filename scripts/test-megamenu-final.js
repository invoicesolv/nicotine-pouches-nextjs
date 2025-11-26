const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMegaMenuFinal() {
  try {
    console.log('🔍 Testing MegaMenu final functionality...\n');

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

    // Test the exact logic from MegaMenu
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

    // Test the getRealProductsForBrand function logic
    const getRealProductsForBrand = (brandName) => {
      const products = Object.values(productMap).filter(product => {
        // Extract brand from product name (first word)
        const dbBrand = product.name.split(' ')[0].toLowerCase().trim();
        const searchBrand = brandName.toLowerCase().trim();
        
        // Direct match
        return dbBrand === searchBrand;
      }).slice(0, 10); // Limit to 10 products per brand
      
      return products;
    };

    // Test specific brands
    const testBrands = ['zyn', 'velo', 'cuba', 'iceberg'];
    testBrands.forEach(brand => {
      const brandProducts = getRealProductsForBrand(brand);
      console.log(`\n${brand.toUpperCase()}: ${brandProducts.length} products`);
      
      if (brandProducts.length > 0) {
        brandProducts.slice(0, 3).forEach(p => console.log(`  - ${p.name}`));
      }
    });

    console.log('\n🎉 MegaMenu functionality test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing MegaMenu:', error);
  }
}

testMegaMenuFinal();
