#!/usr/bin/env node
/**
 * Import Enhanced Descriptions Only
 *
 * Updates just the content and excerpt columns (no schema changes needed)
 * Run this while waiting to add the full schema migration.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const INPUT_FILE = path.join(__dirname, '../extracted-products/products_enhanced.json');

async function importDescriptions() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('IMPORT ENHANCED DESCRIPTIONS (content & excerpt only)');
  console.log('════════════════════════════════════════════════════════════\n');

  // Load products
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`📂 Loaded ${products.length} products\n`);

  let successCount = 0;
  let errorCount = 0;
  const batchSize = 50;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);

    process.stdout.write(`   Batch ${batchNum}/${totalBatches}... `);

    // Only update content and excerpt
    const updates = batch.map(p => ({
      id: p.id,
      content: p.descriptions?.long || p.content,
      excerpt: p.descriptions?.short || p.excerpt,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('wp_products')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.log(`❌ ${error.message}`);
      errorCount += batch.length;
    } else {
      console.log('✅');
      successCount += batch.length;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`✅ Updated: ${successCount} products`);
  console.log(`❌ Failed: ${errorCount} products`);
  console.log('════════════════════════════════════════════════════════════\n');

  // Show sample
  const { data: samples } = await supabase
    .from('wp_products')
    .select('name, content, excerpt')
    .limit(3);

  if (samples) {
    console.log('📋 Sample updated products:\n');
    samples.forEach(p => {
      console.log(`   ${p.name}`);
      console.log(`   SHORT: ${p.excerpt?.substring(0, 60)}...`);
      console.log(`   LONG: ${p.content?.substring(0, 100)}...`);
      console.log('');
    });
  }

  console.log('💡 To import brand info & product details, first run the migration:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/vyolbmzuezpoqtdgongz/sql');
  console.log('   2. Run: migrations/add_enhanced_product_columns.sql');
  console.log('   3. Then run: node scripts/import-enhanced-products.js');
}

importDescriptions().catch(console.error);
