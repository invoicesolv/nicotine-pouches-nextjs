const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to escape CSV fields
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return 'N/A';
  }
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper function to check if URL is broken
function checkLinkStatus(url) {
  if (!url || url.trim() === '') {
    return 'BROKEN_LINK';
  }
  return 'OK';
}

// Helper function to check price status
function checkPriceStatus(row) {
  const packSizes = ['price_1pack', 'price_3pack', 'price_5pack', 'price_10pack', 'price_15pack', 'price_20pack', 'price_25pack', 'price_30pack', 'price_50pack', 'price_100pack'];
  const missingPacks = packSizes.filter(pack => !row[pack] || row[pack] === '' || row[pack] === '0');
  
  if (missingPacks.length === packSizes.length) {
    return 'NO_PRICES';
  }
  if (missingPacks.includes('price_15pack')) {
    return 'MISSING_15PACK';
  }
  if (missingPacks.includes('price_1pack')) {
    return 'MISSING_1PACK';
  }
  if (missingPacks.includes('price_10pack')) {
    return 'MISSING_10PACK';
  }
  return 'OK';
}

async function exportVendorProducts() {
  console.log('📊 Starting export of vendor products...');
  
  try {
    // Fetch all vendor products with vendor information
    const { data: products, error } = await supabase
      .from('vendor_products')
      .select(`
        id,
        name,
        url,
        price_1pack,
        price_3pack,
        price_5pack,
        price_10pack,
        price_15pack,
        price_20pack,
        price_25pack,
        price_30pack,
        price_50pack,
        price_100pack,
        vendor_id,
        vendors (
          id,
          name,
          currency,
          needs_currency_conversion
        )
      `);

    if (error) {
      throw error;
    }

    console.log(`✅ Fetched ${products.length} vendor products`);

    // Prepare CSV data
    const csvRows = [];
    
    // CSV Header
    const headers = [
      'ID',
      'Product Name',
      'Vendor Name',
      'Vendor ID',
      'Product URL',
      'Link Status',
      'Price 1 Pack',
      'Price 3 Pack',
      'Price 5 Pack',
      'Price 10 Pack',
      'Price 15 Pack',
      'Price 20 Pack',
      'Price 25 Pack',
      'Price 30 Pack',
      'Price 50 Pack',
      'Price 100 Pack',
      'Currency',
      'Needs Currency Conversion',
      'Price Status',
      'Missing Packs'
    ];
    
    csvRows.push(headers.map(escapeCsvField).join(','));

    // Process each product
    products.forEach(product => {
      const vendor = product.vendors;
      const linkStatus = checkLinkStatus(product.url);
      const priceStatus = checkPriceStatus(product);
      
      // Determine missing packs
      const packSizes = [
        { key: 'price_1pack', name: '1pack' },
        { key: 'price_3pack', name: '3pack' },
        { key: 'price_5pack', name: '5pack' },
        { key: 'price_10pack', name: '10pack' },
        { key: 'price_15pack', name: '15pack' },
        { key: 'price_20pack', name: '20pack' },
        { key: 'price_25pack', name: '25pack' },
        { key: 'price_30pack', name: '30pack' },
        { key: 'price_50pack', name: '50pack' },
        { key: 'price_100pack', name: '100pack' }
      ];
      
      const missingPacks = packSizes
        .filter(pack => !product[pack.key] || product[pack.key] === '' || product[pack.key] === '0')
        .map(pack => pack.name)
        .join('; ');

      const row = [
        product.id,
        product.name || 'N/A',
        vendor?.name || 'N/A',
        product.vendor_id || 'N/A',
        product.url || 'N/A',
        linkStatus,
        product.price_1pack || 'N/A',
        product.price_3pack || 'N/A',
        product.price_5pack || 'N/A',
        product.price_10pack || 'N/A',
        product.price_15pack || 'N/A',
        product.price_20pack || 'N/A',
        product.price_25pack || 'N/A',
        product.price_30pack || 'N/A',
        product.price_50pack || 'N/A',
        product.price_100pack || 'N/A',
        vendor?.currency || 'N/A',
        vendor?.needs_currency_conversion ? 'Yes' : 'No',
        priceStatus,
        missingPacks || 'None'
      ];

      csvRows.push(row.map(escapeCsvField).join(','));
    });

    // Write to CSV file
    const outputPath = path.join(__dirname, '../vendor-products-export.csv');
    fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');

    console.log(`✅ Export completed! File saved to: ${outputPath}`);
    console.log(`📈 Total products exported: ${products.length}`);
    
    // Generate summary statistics
    const brokenLinks = products.filter(p => !p.url || p.url.trim() === '').length;
    const missing15Pack = products.filter(p => !p.price_15pack || p.price_15pack === '' || p.price_15pack === '0').length;
    const missing1Pack = products.filter(p => !p.price_1pack || p.price_1pack === '' || p.price_1pack === '0').length;
    const missing10Pack = products.filter(p => !p.price_10pack || p.price_10pack === '' || p.price_10pack === '0').length;
    
    console.log('\n📊 Summary Statistics:');
    console.log(`   Broken Links: ${brokenLinks}`);
    console.log(`   Missing 15 Pack Price: ${missing15Pack}`);
    console.log(`   Missing 1 Pack Price: ${missing1Pack}`);
    console.log(`   Missing 10 Pack Price: ${missing10Pack}`);

  } catch (error) {
    console.error('❌ Error exporting vendor products:', error);
    process.exit(1);
  }
}

// Run the export
exportVendorProducts();


