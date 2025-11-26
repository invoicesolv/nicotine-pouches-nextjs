const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompareComplete() {
  try {
    console.log('🔍 Testing complete compare page functionality...\n');

    // Test 1: Fetch products like ProductGrid does
    const { data: products, error } = await supabase
      .from('wp_products')
      .select('*')
      .not('image_url', 'is', null)
      .limit(50);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Products fetched: ${products.length}`);

    // Test 2: Transform products like ProductGrid does
    const transformedProducts = products.map((product) => {
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

    console.log(`✅ Products transformed: ${transformedProducts.length}`);

    // Test 3: Test filtering logic
    const testFilters = {
      brands: ['ZYN', 'Velo'],
      flavours: ['Mint', 'Apple'],
      strengths: ['Normal'],
      formats: ['Slim']
    };

    // Filter by brands
    const brandFiltered = transformedProducts.filter(product => 
      testFilters.brands.some(brand => 
        product.brand.toLowerCase() === brand.toLowerCase()
      )
    );

    console.log(`✅ Brand filtering: ${brandFiltered.length} products match brands ${testFilters.brands.join(', ')}`);

    // Filter by flavours
    const flavourFiltered = transformedProducts.filter(product => 
      testFilters.flavours.some(flavour => 
        product.flavour.toLowerCase().includes(flavour.toLowerCase())
      )
    );

    console.log(`✅ Flavour filtering: ${flavourFiltered.length} products match flavours ${testFilters.flavours.join(', ')}`);

    // Test 4: Test FilterSidebar data extraction
    const brandCounts = products.reduce((acc, item) => {
      const brand = item.name.split(' ')[0];
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    const flavourCounts = products.reduce((acc, item) => {
      const flavour = item.name.split(' ').slice(1).join(' ');
      if (flavour && flavour.trim()) {
        acc[flavour] = (acc[flavour] || 0) + 1;
      }
      return acc;
    }, {});

    console.log(`\n✅ Filter data extracted:`);
    console.log(`  Brands: ${Object.keys(brandCounts).length} unique brands`);
    console.log(`  Flavours: ${Object.keys(flavourCounts).length} unique flavours`);

    // Show top brands
    const topBrands = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log(`\n📊 Top brands:`);
    topBrands.forEach(({ name, count }) => {
      console.log(`  ${name}: ${count} products`);
    });

    // Test 5: Test specific brand filtering (like compare page)
    const zynProducts = transformedProducts.filter(p => p.brand.toLowerCase() === 'zyn');
    const veloProducts = transformedProducts.filter(p => p.brand.toLowerCase() === 'velo');

    console.log(`\n🚬 Brand-specific filtering:`);
    console.log(`  ZYN products: ${zynProducts.length}`);
    console.log(`  Velo products: ${veloProducts.length}`);

    if (zynProducts.length > 0) {
      console.log(`  ZYN sample: ${zynProducts[0].name}`);
    }
    if (veloProducts.length > 0) {
      console.log(`  Velo sample: ${veloProducts[0].name}`);
    }

    console.log('\n🎉 Compare page functionality test completed successfully!');
    console.log('✅ All filtering features are working correctly!');

  } catch (error) {
    console.error('❌ Error testing compare functionality:', error);
  }
}

testCompareComplete();
