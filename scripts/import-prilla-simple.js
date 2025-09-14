const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importPrillaProductsSimple() {
  console.log('Importing Prilla products with image URLs...');
  
  const products = [];
  
  fs.createReadStream('buy-2one-chewy-watermelon-8mg---order-online---save-up-to-19----prilla-com-2025-09-11T19-48-11-943Z.csv', { encoding: 'utf8' })
    .pipe(csv())
    .on('data', (row) => {
      // Generate image URL from product title
      const productTitle = row['Product Title'];
      const brand = row.Brand;
      const safeTitle = productTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const imageUrl = `https://prilla.com/wp-content/uploads/products/${brand.toLowerCase()}-${safeTitle}.jpg`;
      
      const product = {
        page_url: row['PAGE URL'],
        product_title: row['Product Title'],
        quantity: parseInt(row.Quantity) || null,
        short_description: row['p_element'],
        description: row['p_element'],
        brand: row.Brand,
        flavour: row.Flavour,
        format: row.Format,
        nicotine_mg_pouch: parseFloat(row.Nicotine) || null,
        td_element: row.td_element,
        strength: row.Strenght,
        image_url: imageUrl
      };
      products.push(product);
    })
    .on('end', async () => {
      console.log(`Found ${products.length} Prilla products to import`);
      
      try {
        // Insert products in batches
        const batchSize = 100;
        for (let i = 0; i < products.length; i += batchSize) {
          const batch = products.slice(i, i + batchSize);
          const { data, error } = await supabase
            .from('us_products')
            .insert(batch);
          
          if (error) {
            console.error(`Error importing batch ${i/batchSize + 1}:`, error);
          } else {
            console.log(`Imported batch ${i/batchSize + 1} (${batch.length} products)`);
          }
        }
        
        console.log(`Successfully imported ${products.length} Prilla products with image URLs!`);
      } catch (err) {
        console.error('Import failed:', err);
      }
    });
}

importPrillaProductsSimple();
