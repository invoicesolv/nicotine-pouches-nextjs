#!/usr/bin/env node
/**
 * Import Enhanced Descriptions by matching product name
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const INPUT_FILE = path.join(__dirname, '../extracted-products/products_enhanced.json');

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('IMPORT ENHANCED DESCRIPTIONS (by product name matching)');
  console.log('════════════════════════════════════════════════════════════\n');

  // Load enhanced products
  const enhanced = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`📂 Loaded ${enhanced.length} enhanced products\n`);

  // Create lookup by name
  const enhancedByName = new Map();
  enhanced.forEach(p => {
    const name = p.name.toLowerCase().trim();
    enhancedByName.set(name, p);
  });

  // Get all products from database
  console.log('📥 Fetching existing products from database...');
  const { data: dbProducts, error: fetchError } = await supabase
    .from('wp_products')
    .select('id, name');

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError.message);
    return;
  }

  console.log(`   Found ${dbProducts.length} products in database\n`);

  // Match and update
  let matchCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  console.log('🔄 Matching and updating products...\n');

  for (const dbProduct of dbProducts) {
    const name = dbProduct.name.toLowerCase().trim();
    const enhancedProduct = enhancedByName.get(name);

    if (enhancedProduct) {
      matchCount++;

      // Update the product
      const { error: updateError } = await supabase
        .from('wp_products')
        .update({
          content: enhancedProduct.descriptions?.long || enhancedProduct.content,
          excerpt: enhancedProduct.descriptions?.short || enhancedProduct.excerpt,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbProduct.id);

      if (updateError) {
        errorCount++;
        if (errorCount <= 3) {
          console.log(`   ❌ ${dbProduct.name}: ${updateError.message}`);
        }
      } else {
        updateCount++;
        if (updateCount <= 5 || updateCount % 100 === 0) {
          console.log(`   ✅ Updated: ${dbProduct.name}`);
        }
      }

      // Small delay
      if (matchCount % 20 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('RESULTS');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`📊 Database products: ${dbProducts.length}`);
  console.log(`📊 Enhanced products: ${enhanced.length}`);
  console.log(`✅ Matched & updated: ${updateCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️ Not matched: ${dbProducts.length - matchCount}`);

  // Show sample of updated content
  console.log('\n📋 Sample of updated products:\n');

  const { data: samples } = await supabase
    .from('wp_products')
    .select('name, content, excerpt')
    .limit(3);

  if (samples) {
    samples.forEach(p => {
      console.log(`   ${p.name}`);
      console.log(`   SHORT: ${p.excerpt?.substring(0, 80)}...`);
      console.log(`   LONG: ${p.content?.substring(0, 120)}...`);
      console.log('');
    });
  }
}

main().catch(console.error);
