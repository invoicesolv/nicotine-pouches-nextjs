const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProducts() {
  try {
    // Check for specific products that might be failing
    const testProducts = [
      'Zyn Cool Mint Mini',
      'Velo Freeze Mint', 
      'Velo Freeze Black',
      'Velo Arctic Grapefruit'
    ];

    console.log('Checking for specific products:');
    for (const productName of testProducts) {
      const { data, error } = await supabase
        .from('products')
        .select('name, brand')
        .eq('name', productName);

      if (error) {
        console.log(`❌ Error for "${productName}":`, error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ Found "${productName}":`, data[0]);
      } else {
        console.log(`❌ Not found "${productName}"`);
        
        // Try case-insensitive search
        const { data: caseInsensitive, error: ciError } = await supabase
          .from('products')
          .select('name, brand')
          .ilike('name', `%${productName}%`);
          
        if (caseInsensitive && caseInsensitive.length > 0) {
          console.log(`  🔍 Case-insensitive matches:`, caseInsensitive.map(p => p.name));
        }
      }
    }

    // Check what Zyn products exist
    console.log('\nZyn products in database:');
    const { data: zynProducts, error: zynError } = await supabase
      .from('products')
      .select('name, brand')
      .ilike('brand', '%Zyn%')
      .limit(10);

    if (zynProducts) {
      zynProducts.forEach(product => {
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        console.log(`"${product.name}" -> "${slug}"`);
      });
    }

    // Check what Velo products exist
    console.log('\nVelo products in database:');
    const { data: veloProducts, error: veloError } = await supabase
      .from('products')
      .select('name, brand')
      .ilike('brand', '%Velo%')
      .limit(10);

    if (veloProducts) {
      veloProducts.forEach(product => {
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        console.log(`"${product.name}" -> "${slug}"`);
      });
    }

    // Test brand matching
    console.log('\nTesting brand matching:');
    const testBrands = ['Velo', 'ZYN', 'Zyn'];
    for (const brand of testBrands) {
      console.log(`Testing brand: "${brand}"`);
      const { data: products } = await supabase
        .from('products')
        .select('name, brand')
        .ilike('brand', `%${brand}%`)
        .limit(3);
      console.log(`  Found ${products?.length || 0} products`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugProducts();
