const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (e) {
  // dotenv might not be available, try alternative path
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e2) {
    console.log('⚠️  Could not load .env.local, using environment variables or defaults');
  }
}

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.CRAWLER_API_KEY || 'your-secret-crawler-key-change-this';
const CSV_FILE = process.env.CSV_FILE || '/Users/solvifyab/scraperpouch/scraped_results.csv';
const VENDOR_NAME = process.env.VENDOR_NAME || 'Snusifer';
const VENDOR_ID = process.env.VENDOR_ID || null; // Optional: override vendor name lookup

// Validate API key
if (!API_KEY || API_KEY === 'your-secret-crawler-key-change-this') {
  console.error('❌ ERROR: CRAWLER_API_KEY is not set or is using default value!');
  console.error('   Please set CRAWLER_API_KEY in .env.local or as environment variable');
  process.exit(1);
}

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Find column indices
  const urlIndex = headers.findIndex(h => h.toLowerCase() === 'url');
  const productNameIndex = headers.findIndex(h => h.toLowerCase().includes('product') && h.toLowerCase().includes('name'));
  const price1PackIndex = headers.findIndex(h => h.toLowerCase().includes('1-pack') || h.toLowerCase().includes('1pack'));
  const price15PackIndex = headers.findIndex(h => h.toLowerCase().includes('15-pack') || h.toLowerCase().includes('15pack'));
  const price30PackIndex = headers.findIndex(h => h.toLowerCase().includes('30-pack') || h.toLowerCase().includes('30pack'));
  const price50PackIndex = headers.findIndex(h => h.toLowerCase().includes('50-pack') || h.toLowerCase().includes('50pack'));
  const price100PackIndex = headers.findIndex(h => h.toLowerCase().includes('100-pack') || h.toLowerCase().includes('100pack'));

  if (productNameIndex === -1) {
    throw new Error('Could not find "Product Name" column in CSV');
  }

  // Parse data rows
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parsing (handles quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') {
        inQuotes = !inQuotes;
      } else if (line[j] === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += line[j];
      }
    }
    values.push(current.trim());

    const productName = values[productNameIndex];
    if (!productName || productName.trim() === '') {
      continue; // Skip rows without product name
    }

    products.push({
      productName: productName,
      url: urlIndex !== -1 ? values[urlIndex] : null,
      '1-pack': price1PackIndex !== -1 ? values[price1PackIndex] : null,
      '15-pack': price15PackIndex !== -1 ? values[price15PackIndex] : null,
      '30-pack': price30PackIndex !== -1 ? values[price30PackIndex] : null,
      '50-pack': price50PackIndex !== -1 ? values[price50PackIndex] : null,
      '100-pack': price100PackIndex !== -1 ? values[price100PackIndex] : null
    });
  }

  return products;
}

// Send data to API
async function sendToAPI(products) {
  const url = `${API_URL}/api/crawler/enrich-prices`;
  
  const payload = {
    vendorName: VENDOR_NAME,
    ...(VENDOR_ID && { vendorId: parseInt(VENDOR_ID) }),
    products: products
  };

  console.log(`📤 Sending ${products.length} products to API...`);
  console.log(`   Vendor: ${VENDOR_NAME}${VENDOR_ID ? ` (ID: ${VENDOR_ID})` : ''}`);
  console.log(`   API URL: ${url}`);
  console.log(`   API Key loaded: ${API_KEY ? 'YES' : 'NO'}`);
  console.log(`   API Key length: ${API_KEY?.length || 0}`);
  console.log(`   API Key first 10: ${API_KEY?.substring(0, 10) || 'NOT SET'}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error sending data to API:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting scraped data import...\n');

    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE)) {
      throw new Error(`CSV file not found: ${CSV_FILE}`);
    }

    console.log(`📄 Reading CSV file: ${CSV_FILE}`);
    const products = parseCSV(CSV_FILE);
    console.log(`✅ Parsed ${products.length} products from CSV\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found in CSV file');
      return;
    }

    // Send to API
    const result = await sendToAPI(products);

    // Display results
    console.log('\n📊 Import Results:');
    console.log('='.repeat(50));
    console.log(`Vendor: ${result.vendorName} (ID: ${result.vendorId})`);
    console.log(`Total Products: ${result.summary.total}`);
    console.log(`✅ Success: ${result.summary.success}`);
    console.log(`❌ Failed: ${result.summary.failed}`);
    console.log(`🔄 Updated: ${result.summary.updated}`);
    console.log(`➕ Created: ${result.summary.created}`);

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.product}: ${err.error}`);
      });
    }

    console.log('\n✅ Import completed!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseCSV, sendToAPI };

