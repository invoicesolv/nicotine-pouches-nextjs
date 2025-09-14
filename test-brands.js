const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrands() {
  try {
    // Test Velo products specifically
    const { data: veloProducts, error } = await supabase
      .from('products')
      .select('name, brand')
      .ilike('brand', '%Velo%')
      .limit(5);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Velo products in database:');
    veloProducts.forEach(product => {
      const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const properCaseName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`Name: "${product.name}" -> Slug: "${slug}" -> Back to: "${properCaseName}"`);
      console.log(`  Match: ${product.name === properCaseName ? 'YES' : 'NO'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

testBrands();
