#!/usr/bin/env node
/**
 * Fix descriptions - convert to clean plain text (no markdown)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const INPUT_FILE = path.join(__dirname, '../extracted-products/products_enhanced.json');

/**
 * Generate clean plain text description (no markdown)
 */
function generatePlainTextDescription(product) {
  const brand = product.brand;
  const info = product.product_info;
  const flavourDesc = product.descriptions?.long?.split('\n\n')[0] || '';

  const parts = [];

  // Opening flavour description
  if (flavourDesc && !flavourDesc.includes('**')) {
    parts.push(flavourDesc);
  } else {
    // Extract just the first sentence from the long description
    const firstPart = product.descriptions?.long?.split('.')[0];
    if (firstPart) parts.push(firstPart + '.');
  }

  // Nicotine info
  if (info?.nicotine_mg) {
    parts.push(`Contains ${info.nicotine_mg}mg of nicotine per pouch.`);
  }

  // Format info
  if (info?.format && info.format !== 'regular') {
    const formatText = info.format === 'slim'
      ? 'Slim format pouches that sit discreetly under the lip.'
      : info.format === 'mini'
      ? 'Mini format for maximum discretion.'
      : `${info.format.charAt(0).toUpperCase() + info.format.slice(1)} format pouches.`;
    parts.push(formatText);
  }

  // Brand heritage (shortened)
  if (brand?.name && brand?.country && brand.country !== 'Europe') {
    parts.push(`${brand.name} is a ${brand.country}-based brand.`);
  }

  // Usage note based on strength
  if (info?.strength === 'strong' || info?.strength === 'extra strong') {
    parts.push('Recommended for experienced users.');
  } else if (info?.strength === 'ultra') {
    parts.push('High strength - for experienced users only.');
  } else if (info?.strength === 'light') {
    parts.push('Suitable for beginners and light users.');
  }

  return parts.join(' ');
}

/**
 * Generate clean short description
 */
function generateShortDescription(product) {
  const info = product.product_info;
  const brand = product.brand;

  const parts = [];

  // Flavour
  if (info?.flavour_category && info.flavour_category !== 'default') {
    const flavour = info.flavour_category.charAt(0).toUpperCase() + info.flavour_category.slice(1);
    parts.push(flavour);
  }

  // Strength
  if (info?.nicotine_mg) {
    parts.push(`${info.nicotine_mg}mg`);
  } else if (info?.strength && info.strength !== 'regular') {
    parts.push(info.strength);
  }

  // Format
  if (info?.format && info.format !== 'regular') {
    parts.push(info.format);
  }

  return parts.join(' · ') || product.name;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('FIXING DESCRIPTIONS - Converting to plain text');
  console.log('═'.repeat(60) + '\n');

  // Load enhanced products
  const enhanced = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`📂 Loaded ${enhanced.length} products\n`);

  // Create lookup by name
  const enhancedByName = new Map();
  enhanced.forEach(p => {
    enhancedByName.set(p.name.toLowerCase().trim(), p);
  });

  // Get all products from database
  console.log('📥 Fetching products from database...');
  const { data: dbProducts, error } = await supabase
    .from('wp_products')
    .select('id, name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`   Found ${dbProducts.length} products\n`);
  console.log('🔄 Updating with clean plain text descriptions...\n');

  let updated = 0;
  let errors = 0;

  for (const dbProduct of dbProducts) {
    const enhancedProduct = enhancedByName.get(dbProduct.name.toLowerCase().trim());

    if (enhancedProduct) {
      const plainContent = generatePlainTextDescription(enhancedProduct);
      const plainExcerpt = generateShortDescription(enhancedProduct);

      const { error: updateError } = await supabase
        .from('wp_products')
        .update({
          content: plainContent,
          excerpt: plainExcerpt,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbProduct.id);

      if (updateError) {
        errors++;
      } else {
        updated++;
        if (updated <= 5) {
          console.log(`   ✅ ${dbProduct.name}`);
          console.log(`      "${plainContent.substring(0, 80)}..."\n`);
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
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);

  // Show sample from DB
  console.log('\n📋 Sample from database:\n');
  const { data: samples } = await supabase
    .from('wp_products')
    .select('name, content, excerpt')
    .limit(3);

  samples?.forEach(p => {
    console.log(`${p.name}`);
    console.log(`  Short: ${p.excerpt}`);
    console.log(`  Long: ${p.content?.substring(0, 100)}...`);
    console.log('');
  });
}

main().catch(console.error);
