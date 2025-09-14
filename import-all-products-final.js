const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration with correct credentials
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importAllProducts() {
  try {
    console.log('Starting complete product import...');
    
    // Clear existing products first
    console.log('Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('us_products')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.error('Error clearing products:', deleteError);
      return;
    }
    
    console.log('Existing products cleared');
    
    // Read the fixed product data
    const fixedData = JSON.parse(fs.readFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/zyn_products_data.json', 'utf8'));
    
    // Process each product to extract numeric nicotine value and correct brand
    const processedProducts = fixedData.map(product => {
      const nicotineMatch = product.nicotine_mg_pouch.match(/(\d+)/);
      const nicotineValue = nicotineMatch ? parseInt(nicotineMatch[1]) : 6;
      
      // Extract brand from product title
      const title = product.product_title.toUpperCase();
      const brands = [
        'WHITE FOX', 'JUICE HEAD', 'SIBERIA', 'XQS', 'LUCY', 'FRE', 'GRIZZLY', 
        'BRIDGE', 'HIT', 'SESH', 'VELO', 'ROGUE', 'SYX', 'NIC-S', 'VITO', 
        'ZIMO', 'ZONE', 'ZEO', 'ON', 'ALP', '2ONE', 'ZYN'
      ];
      
      let brand = 'UNKNOWN';
      for (const b of brands) {
        if (title.includes(b)) {
          brand = b;
          break;
        }
      }
      
      // Extract flavour
      let flavour = product.product_title;
      if (brand !== 'UNKNOWN') {
        flavour = flavour.replace(new RegExp(`^${brand}\\s*`, 'i'), '');
      }
      flavour = flavour.replace(/\s*\d+mg\s*$/, '').trim() || 'Original';
      
      return {
        product_title: product.product_title.replace(/'/g, "''"),
        brand: brand,
        flavour: flavour,
        strength: product.strength,
        format: product.format,
        nicotine_mg_pouch: nicotineValue,
        td_element: brand,
        description: product.description.replace(/'/g, "''"),
        page_url: product.page_url,
        image_url: product.image_url
      };
    });
    
    console.log(`Processing ${processedProducts.length} products...`);
    
    // Count brands
    const brandCounts = {};
    processedProducts.forEach(product => {
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
    });
    
    console.log('Brand distribution:');
    Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`${brand}: ${count} products`);
      });
    
    // Import in batches of 50
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < processedProducts.length; i += batchSize) {
      const batch = processedProducts.slice(i, i + batchSize);
      
      console.log(`Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(processedProducts.length/batchSize)} (${batch.length} products)...`);
      
      const { data, error } = await supabase
        .from('us_products')
        .insert(batch);
      
      if (error) {
        console.error(`Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        // Try individual inserts for this batch
        for (const product of batch) {
          try {
            const { error: singleError } = await supabase
              .from('us_products')
              .insert([product]);
            if (!singleError) {
              imported++;
            } else {
              console.error(`Failed to import ${product.product_title}:`, singleError.message);
            }
          } catch (err) {
            console.error(`Error importing ${product.product_title}:`, err.message);
          }
        }
      } else {
        imported += batch.length;
        console.log(`Batch ${Math.floor(i/batchSize) + 1} imported successfully`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Import completed! Total products imported: ${imported}`);
    
    // Verify the import
    const { data: count, error: countError } = await supabase
      .from('us_products')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log(`Final count in database: ${count.length} products`);
    }
    
    // Show final brand distribution
    const { data: brandData, error: brandError } = await supabase
      .from('us_products')
      .select('brand');
    
    if (!brandError && brandData) {
      const finalBrandCounts = {};
      brandData.forEach(item => {
        finalBrandCounts[item.brand] = (finalBrandCounts[item.brand] || 0) + 1;
      });
      
      console.log('\nFinal brand distribution in database:');
      Object.entries(finalBrandCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([brand, count]) => {
          console.log(`${brand}: ${count} products`);
        });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

importAllProducts();
