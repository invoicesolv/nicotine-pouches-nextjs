const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to escape CSV fields
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return '';
  }
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportOutOfStockProducts() {
  console.log('📊 Starting export of out-of-stock products...');
  
  try {
    // Fetch all out-of-stock products with pagination (Supabase limit is 1000 per query)
    const batchSize = 1000;
    let allProducts = [];
    let offset = 0;
    let hasMore = true;

    console.log('📥 Fetching products in batches...');
    
    while (hasMore) {
      const { data: products, error } = await supabase
        .from('vendor_products')
        .select(`
          id,
          name,
          url,
          stock_status,
          updated_at,
          vendor_id,
          vendors (
            id,
            name
          )
        `)
        .eq('stock_status', 'out_of_stock')
        .range(offset, offset + batchSize - 1);

      if (error) {
        throw error;
      }

      if (products && products.length > 0) {
        allProducts = allProducts.concat(products);
        console.log(`   Fetched ${products.length} products (total: ${allProducts.length})...`);
        offset += batchSize;
        hasMore = products.length === batchSize; // Continue if we got a full batch
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Fetched ${allProducts.length} out-of-stock products total`);
    const products = allProducts;

    // Prepare CSV data
    const csvRows = [];
    
    // CSV Header
    const headers = [
      'ID',
      'Product Name',
      'Vendor Name',
      'Vendor ID',
      'Product URL',
      'Stock Status',
      'Last Updated'
    ];
    
    csvRows.push(headers.map(escapeCsvField).join(','));

    // Process each product
    products.forEach(product => {
      const vendor = product.vendors;
      
      const row = [
        product.id,
        product.name || '',
        vendor?.name || '',
        product.vendor_id || '',
        product.url || '',
        product.stock_status || '',
        product.updated_at || ''
      ];

      csvRows.push(row.map(escapeCsvField).join(','));
    });

    // Write to CSV file on desktop
    const desktopPath = path.join(process.env.HOME || '/Users/solvifyab', 'Desktop');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `out-of-stock-products-${timestamp}.csv`;
    const outputPath = path.join(desktopPath, filename);
    
    fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');

    console.log(`✅ Export completed! File saved to: ${outputPath}`);
    console.log(`📈 Total out-of-stock products exported: ${products.length}`);
    
    // Generate summary statistics by vendor
    const vendorStats = {};
    products.forEach(product => {
      const vendorName = product.vendors?.name || 'Unknown';
      vendorStats[vendorName] = (vendorStats[vendorName] || 0) + 1;
    });
    
    console.log('\n📊 Summary Statistics by Vendor:');
    Object.entries(vendorStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([vendor, count]) => {
        console.log(`   ${vendor}: ${count}`);
      });

    // Count products without URLs
    const productsWithoutUrls = products.filter(p => !p.url || p.url.trim() === '').length;
    console.log(`\n⚠️  Products without URLs: ${productsWithoutUrls}`);

  } catch (error) {
    console.error('❌ Error exporting out-of-stock products:', error);
    process.exit(1);
  }
}

// Run the export
exportOutOfStockProducts();

