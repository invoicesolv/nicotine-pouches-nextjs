#!/usr/bin/env node
/**
 * Import Enhanced Product Descriptions to Supabase
 *
 * This script updates the wp_products table with:
 * - Enhanced short/long descriptions
 * - Brand heritage and founder info
 * - Product details (format, strength, nicotine mg)
 * - Usage tips
 *
 * Usage: node scripts/import-enhanced-products.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration (using service role for DDL operations)
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Input file
const INPUT_FILE = path.join(__dirname, '../extracted-products/products_enhanced.json');

/**
 * Check table structure by querying a sample row
 */
async function checkTableExists() {
  console.log('🔍 Checking table structure...');

  try {
    const { data, error } = await supabase
      .from('wp_products')
      .select('id, name')
      .limit(1);

    if (error) {
      console.log(`   ⚠️ Table check: ${error.message}`);
      return false;
    }

    console.log(`   ✅ Table wp_products exists`);
    return true;
  } catch (e) {
    console.log(`   ❌ Error checking table: ${e.message}`);
    return false;
  }
}

/**
 * Transform enhanced product data for Supabase
 */
function transformProduct(product) {
  return {
    id: product.id,
    name: product.name,
    content: product.descriptions?.long || product.content,
    excerpt: product.descriptions?.short || product.excerpt,

    // Original content preserved
    content_original: product.descriptions?.original || product.content,

    // Image data
    image_url: product.image?.original_url || null,
    image_title: product.image?.title || null,
    image_filename: product.image?.filename || null,
    image_local_path: product.image?.local_path || null,

    // Product metadata
    price: parseFloat(product.meta?.price) || 0,
    sale_price: product.meta?.sale_price ? parseFloat(product.meta.sale_price) : null,
    sku: product.meta?.sku || null,
    stock_status: product.meta?.stock_status || 'instock',

    // Enhanced descriptions
    description_short: product.descriptions?.short || null,
    description_long: product.descriptions?.long || null,

    // Brand info
    brand_name: product.brand?.name || null,
    brand_country: product.brand?.country || null,
    brand_parent_company: product.brand?.parentCompany || null,
    brand_founded: product.brand?.founded || null,
    brand_founders: product.brand?.founders || null,
    brand_heritage: product.brand?.heritage || null,
    brand_story: product.brand?.story || null,
    brand_facts: product.brand?.facts || null,
    brand_website: product.brand?.website || null,

    // Product details
    pouch_format: product.product_info?.format || null,
    strength_category: product.product_info?.strength || null,
    nicotine_mg: product.product_info?.nicotine_mg || null,
    flavour_category: product.product_info?.flavour_category || null,

    // Usage info
    usage_tips: product.usage?.tips || null,
    usage_beginners: product.usage?.for_beginners || null,
    usage_switchers: product.usage?.for_switchers || null,

    // Timestamp
    updated_at: new Date().toISOString()
  };
}

/**
 * Import products in batches
 */
async function importProducts(products, batchSize = 50) {
  console.log(`\n🚀 Importing ${products.length} enhanced products...`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);

    process.stdout.write(`   Batch ${batchNum}/${totalBatches}... `);

    // Transform products
    const transformed = batch.map(transformProduct);

    // Upsert to Supabase
    const { data, error } = await supabase
      .from('wp_products')
      .upsert(transformed, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      errorCount += batch.length;
      errors.push({ batch: batchNum, error: error.message });
    } else {
      console.log('✅');
      successCount += batch.length;
    }

    // Rate limiting
    if (i + batchSize < products.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return { successCount, errorCount, errors };
}

/**
 * Verify the import
 */
async function verifyImport() {
  console.log('\n🔍 Verifying import...');

  // Count total products
  const { count: total } = await supabase
    .from('wp_products')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total products in database: ${total}`);

  // Count products with enhanced descriptions
  const { count: enhanced } = await supabase
    .from('wp_products')
    .select('*', { count: 'exact', head: true })
    .not('description_short', 'is', null);

  console.log(`   Products with enhanced descriptions: ${enhanced}`);

  // Count products with brand info
  const { count: withBrand } = await supabase
    .from('wp_products')
    .select('*', { count: 'exact', head: true })
    .not('brand_heritage', 'is', null);

  console.log(`   Products with brand heritage: ${withBrand}`);

  // Sample output
  const { data: samples } = await supabase
    .from('wp_products')
    .select('name, description_short, brand_name, nicotine_mg, pouch_format')
    .not('description_short', 'is', null)
    .limit(5);

  if (samples && samples.length > 0) {
    console.log('\n📋 Sample enhanced products:');
    samples.forEach(p => {
      console.log(`   • ${p.name}`);
      console.log(`     ${p.description_short}`);
      console.log(`     Brand: ${p.brand_name}, ${p.nicotine_mg}mg, ${p.pouch_format}`);
    });
  }
}

/**
 * Create brand lookup table
 */
async function createBrandTable(products) {
  console.log('\n📊 Creating brand lookup table...');

  // Extract unique brands
  const brandsMap = new Map();
  products.forEach(p => {
    if (p.brand?.name && !brandsMap.has(p.brand.name)) {
      brandsMap.set(p.brand.name, p.brand);
    }
  });

  const brands = Array.from(brandsMap.values()).map(b => ({
    name: b.name,
    country: b.country,
    parent_company: b.parentCompany,
    founded: b.founded,
    founders: b.founders,
    heritage: b.heritage,
    story: b.story,
    facts: b.facts,
    website: b.website
  }));

  console.log(`   Found ${brands.length} unique brands`);

  // Try to create/update brand table
  const { error: upsertError } = await supabase
    .from('pouch_brands')
    .upsert(brands, { onConflict: 'name' });

  if (upsertError) {
    // Table might not exist, that's OK
    console.log(`   ⚠️ Could not create brand table: ${upsertError.message}`);
    console.log('   Brand info is stored directly in wp_products table instead');
  } else {
    console.log(`   ✅ Saved ${brands.length} brands to pouch_brands table`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('═'.repeat(60));
  console.log('ENHANCED PRODUCT IMPORT');
  console.log('═'.repeat(60));

  // Check input file
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Input file not found:', INPUT_FILE);
    console.error('   Run scripts/rewrite-product-descriptions-v2.js first');
    process.exit(1);
  }

  // Load products
  console.log('\n📂 Loading enhanced products...');
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`   Loaded ${products.length} products`);

  // Check table exists
  const tableExists = await checkTableExists();
  if (!tableExists) {
    console.log('\n⚠️ Table wp_products may not exist or has issues.');
    console.log('   Will attempt import anyway...');
  }

  // Import products
  const { successCount, errorCount, errors } = await importProducts(products);

  // Create brand table
  await createBrandTable(products);

  // Verify
  await verifyImport();

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('═'.repeat(60));
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`);

  if (errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    errors.forEach(e => console.log(`   Batch ${e.batch}: ${e.error}`));
  }

  console.log('\n🎉 Done! Your products now have enhanced descriptions.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
