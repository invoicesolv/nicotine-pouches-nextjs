const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompareFiltering() {
  try {
    console.log('🔍 Testing compare page filtering...\n');

    // Test 1: Fetch all products (like compare page does)
    const { data: allProducts, error: allError } = await supabase
      .from('wp_products')
      .select('*')
      .not('image_url', 'is', null)
      .limit(20);

    if (allError) {
      console.error('❌ Error fetching all products:', allError);
      return;
    }

    console.log(`✅ All products fetched: ${allProducts.length}`);

    // Test 2: Test brand filtering (like ProductGrid does)
    const testBrands = ['ZYN', 'Velo', 'Cuba'];
    
    for (const brand of testBrands) {
      const { data: brandProducts, error: brandError } = await supabase
        .from('wp_products')
        .select('*')
        .ilike('name', `${brand}%`)
        .limit(10);

      if (brandError) {
        console.error(`❌ Error fetching ${brand} products:`, brandError);
        continue;
      }

      console.log(`✅ ${brand} products: ${brandProducts.length}`);
      if (brandProducts.length > 0) {
        console.log(`  Sample: ${brandProducts[0].name}`);
      }
    }

    // Test 3: Test product transformation (like ProductGrid does)
    const transformedProducts = allProducts.map((product) => {
      const brand = product.name.split(' ')[0];
      const flavour = product.name.split(' ').slice(1).join(' ');
      
      return {
        id: product.id,
        name: product.name,
        price: product.price ? `£${parseFloat(product.price).toFixed(2)}` : `£${(2.99 + Math.random() * 2).toFixed(2)}`,
        strength: 'Normal',
        stores: Math.floor(Math.random() * 5) + 1,
        watching: Math.floor(Math.random() * 30) + 10,
        image: product.image_url || '/placeholder-product.jpg',
        link: `/product/${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        brand: brand,
        flavour: flavour,
        format: 'Slim'
      };
    });

    console.log(`\n✅ Product transformation successful: ${transformedProducts.length} products`);
    console.log('Sample transformed product:', {
      name: transformedProducts[0].name,
      brand: transformedProducts[0].brand,
      flavour: transformedProducts[0].flavour,
      price: transformedProducts[0].price
    });

    // Test 4: Test filter data extraction (like FilterSidebar does)
    const brandCounts = allProducts.reduce((acc, item) => {
      const brand = item.name.split(' ')[0];
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    const topBrands = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log('\n✅ Top brands extracted:');
    topBrands.forEach(({ name, count }) => {
      console.log(`  ${name}: ${count} products`);
    });

    console.log('\n🎉 Compare page filtering test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing compare filtering:', error);
  }
}

testCompareFiltering();
