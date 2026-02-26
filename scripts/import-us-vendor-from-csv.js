#!/usr/bin/env node
/**
 * Import US vendor products from scraperpouch scraped_results.csv into us_vendor_products_new.
 * Usage: node scripts/import-us-vendor-from-csv.js [SnusDaddy|GotPouches|SnusDirect]
 * Run from nicotine-pouches-nextjs; expects ../scraperpouch/<Vendor>/scraped_results.csv
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const VENDORS = {
  SnusDaddy: {
    us_vendor_id: '4ac9a8e1-783b-4dc6-9a1c-36a6250ef8be',
    csvColumns: { url: 'URL', name: 'Product Name', p1: '1 Pack', p10: '10 Pack', p30: '30 Pack', p20: '20 Pack', p25: '25 Pack', p50: '50 Pack' },
  },
  GotPouches: {
    us_vendor_id: '94648839-ad96-444e-9ef8-9df1fe76e721',
    csvColumns: { url: 'URL', name: 'Product Name', p1: '1 Pack', p10: '10 Pack', p20: '20 Pack', p30: '30 Pack', p25: '25 Pack', p50: '50 Pack' },
  },
  SnusDirect: {
    us_vendor_id: '691117a4-eeb6-4939-aca0-be7aaede1223',
    csvColumns: { url: 'URL', name: 'Product Name', p1: '1 Pack', p10: '10 Pack', p20: '20 Pack', p30: '30 Pack', p25: '25 Pack', p50: '50 Pack' },
  },
};

function parsePrice(val) {
  if (val == null || val === '') return null;
  const s = String(val).replace(/[$,\s]/g, '').trim();
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function readCsvRowsSync(filePath) {
  const csv = require('csv-parser');
  const rows = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function importVendor(vendorName) {
  const config = VENDORS[vendorName];
  if (!config) {
    console.error('Unknown vendor. Use: SnusDaddy | GotPouches | SnusDirect');
    process.exit(1);
  }

  // scraperpouch is sibling of nicotine-pouches-nextjs
  const scraperpouch = path.resolve(__dirname, '..', '..', 'scraperpouch');
  const csvPath = path.join(scraperpouch, vendorName, 'scraped_results.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  const rows = await readCsvRowsSync(csvPath);
  const cols = config.csvColumns;

  const products = rows
    .filter((r) => r[cols.name] && r[cols.name].trim())
    .map((r) => {
      const p1 = parsePrice(r[cols.p1]);
      const p10 = parsePrice(r[cols.p10]);
      const p30 = parsePrice(r[cols.p30]);
      const p20 = parsePrice(r[cols.p20]);
      const p25 = parsePrice(r[cols.p25]);
      const p50 = parsePrice(r[cols.p50]);
      const hasPrice = [p1, p10, p20, p25, p30, p50].some((x) => x != null);
      return {
        us_vendor_id: config.us_vendor_id,
        name: r[cols.name].trim(),
        url: (r[cols.url] && r[cols.url].trim()) || null,
        brand: null,
        price_1pack: p1,
        price_3pack: null,
        price_5pack: null,
        price_10pack: p10,
        price_20pack: p20,
        price_25pack: p25,
        price_30pack: p30,
        price_50pack: p50,
        stock_status: hasPrice ? 'in_stock' : 'out_of_stock',
      };
    });

  console.log(`${vendorName}: ${products.length} products from CSV`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const BATCH = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const { data, error } = await supabase.from('us_vendor_products_new').insert(batch).select('id');

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += (data && data.length) || batch.length;
      console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} inserted`);
    }
  }

  console.log(`Done. Inserted: ${inserted}, errors: ${errors}`);
  return { inserted, errors };
}

const vendor = process.argv[2] || 'SnusDaddy';
importVendor(vendor).catch((e) => {
  console.error(e);
  process.exit(1);
});
