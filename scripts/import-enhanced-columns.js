#!/usr/bin/env node
/**
 * Import Enhanced Product Data to New Columns
 *
 * Populates brand_name, pouch_format, nicotine_mg, flavour_category, strength_category
 * and other enhanced columns.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const INPUT_FILE = path.join(__dirname, '../extracted-products/products_enhanced.json');

async function main() {
  console.log('═'.repeat(60));
  console.log('IMPORTING ENHANCED PRODUCT DATA TO NEW COLUMNS');
  console.log('═'.repeat(60) + '\n');

  // Load enhanced products
  const enhanced = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Loaded ${enhanced.length} enhanced products\n`);

  // Create lookup by name
  const enhancedByName = new Map();
  enhanced.forEach(p => {
    enhancedByName.set(p.name.toLowerCase().trim(), p);
  });

  // Get all products from database
  console.log('Fetching products from database...');
  const { data: dbProducts, error } = await supabase
    .from('wp_products')
    .select('id, name');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Found ${dbProducts.length} products\n`);
  console.log('Updating enhanced columns...\n');

  let updated = 0;
  let errors = 0;

  for (const dbProduct of dbProducts) {
    const enhancedProduct = enhancedByName.get(dbProduct.name.toLowerCase().trim());

    if (enhancedProduct) {
      const updateData = {
        // Brand information
        brand_name: enhancedProduct.brand?.name || null,
        brand_country: enhancedProduct.brand?.country || null,
        brand_parent_company: enhancedProduct.brand?.parentCompany || null,
        brand_founded: enhancedProduct.brand?.founded || null,
        brand_founders: enhancedProduct.brand?.founders || null,
        brand_heritage: enhancedProduct.brand?.heritage || null,
        brand_story: enhancedProduct.brand?.story || null,
        brand_facts: enhancedProduct.brand?.facts || null,
        brand_website: enhancedProduct.brand?.website || null,

        // Product details
        pouch_format: enhancedProduct.product_info?.format || null,
        strength_category: enhancedProduct.product_info?.strength || null,
        nicotine_mg: enhancedProduct.product_info?.nicotine_mg || null,
        flavour_category: enhancedProduct.product_info?.flavour_category || null,

        // Usage information
        usage_tips: enhancedProduct.usage?.tips || null,
        usage_beginners: enhancedProduct.usage?.for_beginners || null,
        usage_switchers: enhancedProduct.usage?.for_switchers || null,

        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('wp_products')
        .update(updateData)
        .eq('id', dbProduct.id);

      if (updateError) {
        errors++;
        if (errors <= 3) {
          console.log(`   Error ${dbProduct.name}: ${updateError.message}`);
        }
      } else {
        updated++;
        if (updated <= 5) {
          console.log(`   Updated: ${dbProduct.name}`);
          console.log(`      Brand: ${updateData.brand_name}, Format: ${updateData.pouch_format}, Strength: ${updateData.nicotine_mg}mg`);
        } else if (updated % 100 === 0) {
          console.log(`   ... ${updated} updated`);
        }
      }
    }

    // Rate limit
    if (updated % 20 === 0) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);

  // Show sample from DB
  console.log('\nSample from database:\n');
  const { data: samples } = await supabase
    .from('wp_products')
    .select('name, brand_name, pouch_format, nicotine_mg, flavour_category, strength_category')
    .not('brand_name', 'is', null)
    .limit(5);

  samples?.forEach(p => {
    console.log(`${p.name}`);
    console.log(`  Brand: ${p.brand_name}, Format: ${p.pouch_format}, Nicotine: ${p.nicotine_mg}mg`);
    console.log(`  Flavour: ${p.flavour_category}, Strength: ${p.strength_category}`);
    console.log('');
  });
}

main().catch(console.error);
