const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importUSProducts() {
  const products = [];
  
  fs.createReadStream('wc-product-export-11-9-2025-1757618356911.csv')
    .pipe(csv())
    .on('data', (row) => {
      const product = {
        wp_id: parseInt(row.ID),
        type: row.Type,
        sku: row.SKU,
        gtin: row['GTIN, UPC, EAN, or ISBN'],
        name: row.Name,
        published: row.Published === '1',
        is_featured: row['Is featured?'] === '1',
        visibility: row['Visibility in catalogue'],
        short_description: row['Short description'],
        description: row.Description,
        sale_price_start: row['Date sale price starts'] || null,
        sale_price_end: row['Date sale price ends'] || null,
        tax_status: row['Tax status'],
        tax_class: row['Tax class'],
        in_stock: row['In stock?'] === '1',
        stock: parseInt(row.Stock) || 0,
        low_stock_amount: parseInt(row['Low stock amount']) || 0,
        backorders_allowed: row['Backorders allowed?'] === '1',
        sold_individually: row['Sold individually?'] === '1',
        weight_kg: parseFloat(row['Weight (kg)']) || null,
        length_cm: parseFloat(row['Length (cm)']) || null,
        width_cm: parseFloat(row['Width (cm)']) || null,
        height_cm: parseFloat(row['Height (cm)']) || null,
        allow_reviews: row['Allow customer reviews?'] === '1',
        purchase_note: row['Purchase note'],
        sale_price: parseFloat(row['Sale price']) || null,
        regular_price: parseFloat(row['Regular price']) || null,
        categories: row.Categories ? row.Categories.split(',').map(c => c.trim()) : [],
        tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : [],
        shipping_class: row['Shipping class'],
        images: row.Images ? row.Images.split(',').map(i => i.trim()) : [],
        download_limit: parseInt(row['Download limit']) || null,
        download_expiry_days: parseInt(row['Download expiry days']) || null,
        parent_id: parseInt(row.Parent) || null,
        grouped_products: row['Grouped products'] ? row['Grouped products'].split(',').map(p => p.trim()) : [],
        upsells: row.Upsells ? row.Upsells.split(',').map(u => u.trim()) : [],
        cross_sells: row['Cross-sells'] ? row['Cross-sells'].split(',').map(c => c.trim()) : [],
        external_url: row['External URL'],
        button_text: row['Button text'],
        position: parseInt(row.Position) || 0,
        brands: row.Brands ? row.Brands.split(',').map(b => b.trim()) : [],
        attribute_1_name: row['Attribute 1 name'],
        attribute_1_values: row['Attribute 1 value(s)'] ? row['Attribute 1 value(s)'].split(',').map(v => v.trim()) : [],
        attribute_1_visible: row['Attribute 1 visible'] === '1',
        attribute_1_global: row['Attribute 1 global'] === '1',
        // Additional fields from better CSV
        watching_count: parseInt(row['Meta: _watching_count']) || 0,
        store_count: parseInt(row['Meta: _store_count']) || 0,
        store_count_us: parseInt(row['Meta: _store_count_us']) || 0,
        store_count_uk: parseInt(row['Meta: _store_count_uk']) || 0,
        vendor_price_5pack: parseFloat(row['Meta: _vendor_price_5pack']) || null,
        vendor_price_10pack: parseFloat(row['Meta: _vendor_price_10pack']) || null,
        vendor_price_20pack: parseFloat(row['Meta: _vendor_price_20pack']) || null,
        vendor_link: row['Meta: _vendor_link'],
        vendor_shipping: row['Meta: _vendor_shipping'],
        seo_title: row['Meta: _yoast_wpseo_title'],
        seo_description: row['Meta: _yoast_wpseo_metadesc']
      };
      products.push(product);
    })
    .on('end', async () => {
      console.log(`Found ${products.length} products to import`);
      
      try {
        const { data, error } = await supabase
          .from('us_products')
          .upsert(products, { onConflict: 'wp_id' });
        
        if (error) {
          console.error('Error importing products:', error);
        } else {
          console.log(`Successfully imported ${products.length} US products!`);
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
    });
}

importUSProducts();
