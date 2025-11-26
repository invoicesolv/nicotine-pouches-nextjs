const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWpProducts() {
  try {
    console.log('🔍 Testing WordPress products fetch...\n');

    // Test 1: Get total count
    const { count, error: countError } = await supabase
      .from('wp_products')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log(`✅ Total products: ${count}`);

    // Test 2: Get products with images
    const { data: productsWithImages, error: imagesError } = await supabase
      .from('wp_products')
      .select('id, name, image_url, price')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (imagesError) throw imagesError;
    console.log(`✅ Products with images: ${productsWithImages.length}`);

    // Test 3: Show sample products
    console.log('\n📦 Sample products:');
    productsWithImages.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Price: £${product.price || '0.00'}`);
      console.log(`   Image: ${product.image_url ? '✅' : '❌'}`);
      console.log('');
    });

    // Test 4: Test Zyn products specifically
    const { data: zynProducts, error: zynError } = await supabase
      .from('wp_products')
      .select('id, name, image_url')
      .ilike('name', '%zyn%')
      .not('image_url', 'is', null)
      .limit(5);

    if (zynError) throw zynError;
    console.log(`✅ Zyn products found: ${zynProducts.length}`);
    
    if (zynProducts.length > 0) {
      console.log('\n🚬 Zyn products:');
      zynProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
    }

    console.log('\n🎉 All tests passed! WordPress products are ready for the homepage.');

  } catch (error) {
    console.error('❌ Error testing WordPress products:', error);
  }
}

testWpProducts();
