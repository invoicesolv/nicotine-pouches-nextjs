const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrandPages() {
  try {
    console.log('🔍 Testing brand pages functionality...\n');

    // Test the getBrandData function logic
    const getBrandData = async (slug) => {
      try {
        const brandName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Get all products for this brand (filter by name starting with brand)
        const { data: products, error } = await supabase
          .from('wp_products')
          .select('*')
          .ilike('name', `${brandName}%`)
          .not('image_url', 'is', null)
          .order('name');

        if (error) {
          console.error('Error fetching brand products:', error);
          return null;
        }

        if (!products || products.length === 0) {
          return null;
        }

        // Get the first product as the featured product for the header
        const featuredProduct = products[0];

        return {
          brandName: brandName,
          featuredProduct: {
            id: featuredProduct.id,
            name: featuredProduct.name,
            image: featuredProduct.image_url || '/placeholder-product.jpg',
            description: featuredProduct.content || `Premium ${brandName} nicotine pouches with various strengths and flavors.`,
            brand: featuredProduct.name.split(' ')[0],
            strength_group: 'Normal',
            flavour: featuredProduct.name.split(' ').slice(1).join(' '),
            format: 'Slim'
          },
          totalProducts: products.length
        };
      } catch (error) {
        console.error('Error fetching brand data:', error);
        return null;
      }
    };

    // Test with different brand slugs
    const testSlugs = ['zyn', 'velo', 'cuba', 'iceberg', 'coco'];
    
    for (const slug of testSlugs) {
      console.log(`\n🔍 Testing brand slug: ${slug}`);
      const brandData = await getBrandData(slug);
      
      if (brandData) {
        console.log(`✅ Brand: ${brandData.brandName}`);
        console.log(`   Total products: ${brandData.totalProducts}`);
        console.log(`   Featured product: ${brandData.featuredProduct.name}`);
        console.log(`   Brand: ${brandData.featuredProduct.brand}`);
        console.log(`   Flavour: ${brandData.featuredProduct.flavour}`);
        console.log(`   Image: ${brandData.featuredProduct.image ? '✅' : '❌'}`);
      } else {
        console.log(`⚠️  No products found for brand: ${slug}`);
      }
    }

    // Test specific brands that should have products
    console.log(`\n🔍 Testing specific brands:`);
    
    const zynData = await getBrandData('zyn');
    if (zynData) {
      console.log(`✅ ZYN: ${zynData.totalProducts} products found`);
      console.log(`   Sample: ${zynData.featuredProduct.name}`);
    } else {
      console.log(`❌ ZYN: No products found`);
    }

    const veloData = await getBrandData('velo');
    if (veloData) {
      console.log(`✅ Velo: ${veloData.totalProducts} products found`);
      console.log(`   Sample: ${veloData.featuredProduct.name}`);
    } else {
      console.log(`❌ Velo: No products found`);
    }

    console.log('\n🎉 Brand pages functionality test completed!');

  } catch (error) {
    console.error('❌ Error testing brand pages:', error);
  }
}

testBrandPages();
