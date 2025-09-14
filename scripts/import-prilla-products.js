const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importPrillaProducts() {
  const products = [];
  
  fs.createReadStream('buy-2one-chewy-watermelon-8mg---order-online---save-up-to-19----prilla-com-2025-09-11T19-48-11-943Z.csv')
    .pipe(csv())
    .on('data', (row) => {
      const product = {
        wp_id: null, // No WP ID for Prilla products
        type: 'simple',
        sku: null,
        gtin: null,
        name: row['Product Title'],
        published: true,
        is_featured: false,
        visibility: 'visible',
        short_description: row['p_element'],
        description: row['p_element'],
        sale_price_start: null,
        sale_price_end: null,
        tax_status: 'taxable',
        tax_class: null,
        in_stock: true,
        stock: parseInt(row['Quantity']) || 0,
        low_stock_amount: 0,
        backorders_allowed: false,
        sold_individually: false,
        weight_kg: null,
        length_cm: null,
        width_cm: null,
        height_cm: null,
        allow_reviews: true,
        purchase_note: null,
        sale_price: null,
        regular_price: null,
        categories: [row['Brand'], row['Flavour'], row['Format']].filter(Boolean),
        tags: [row['Brand'], row['Flavour'], row['Format'], row['Strenght']].filter(Boolean),
        shipping_class: null,
        images: [],
        download_limit: null,
        download_expiry_days: null,
        parent_id: null,
        grouped_products: [],
        upsells: [],
        cross_sells: [],
        external_url: row['PAGE URL'],
        button_text: null,
        position: 0,
        brands: [row['Brand']].filter(Boolean),
        attribute_1_name: 'Nicotine Strength',
        attribute_1_values: [row['Nicotine']].filter(Boolean),
        attribute_1_visible: true,
        attribute_1_global: true,
        // Additional fields
        watching_count: 0,
        store_count: 1, // Prilla only
        store_count_us: 1,
        store_count_uk: 0,
        vendor_price_5pack: null,
        vendor_price_10pack: null,
        vendor_price_20pack: null,
        vendor_link: row['PAGE URL'],
        vendor_shipping: null,
        seo_title: row['Product Title'],
        seo_description: row['p_element'],
        // Prilla specific fields
        flavour: row['Flavour'],
        format: row['Format'],
        nicotine_strength: row['Nicotine'],
        strength: row['Strenght'],
        manufacturer: row['td_element']
      };
      products.push(product);
    })
    .on('end', async () => {
      console.log(`Found ${products.length} Prilla products to import`);
      
      try {
        const { data, error } = await supabase
          .from('us_products')
          .insert(products);
        
        if (error) {
          console.error('Error importing products:', error);
        } else {
          console.log(`Successfully imported ${products.length} Prilla products!`);
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
    });
}

importPrillaProducts();
