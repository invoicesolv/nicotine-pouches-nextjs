#!/usr/bin/env node
/**
 * Run database migration to add enhanced product columns
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

async function runMigration() {
  console.log('🔧 Running migration to add enhanced product columns...\n');

  const statements = [
    // Enhanced descriptions
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS description_short TEXT`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS description_long TEXT`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS content_original TEXT`,

    // Brand information
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_name VARCHAR(100)`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_country VARCHAR(50)`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_parent_company VARCHAR(100)`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_founded INTEGER`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_founders TEXT`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_heritage TEXT`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_story TEXT`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_facts JSONB`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_website VARCHAR(100)`,

    // Product details
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS pouch_format VARCHAR(20)`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS strength_category VARCHAR(20)`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS nicotine_mg INTEGER`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS flavour_category VARCHAR(50)`,

    // Usage information
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS usage_tips JSONB`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS usage_beginners JSONB`,
    `ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS usage_switchers JSONB`
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const sql of statements) {
    const columnMatch = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
    const columnName = columnMatch ? columnMatch[1] : 'unknown';

    try {
      const { error } = await supabase.rpc('exec', { query: sql });

      if (error) {
        // Try alternative method
        const { error: error2 } = await supabase.from('wp_products').select(columnName).limit(1);
        if (error2 && error2.message.includes('does not exist')) {
          console.log(`   ❌ ${columnName}: Could not add column`);
          errorCount++;
        } else {
          console.log(`   ✅ ${columnName}: Already exists or added`);
          successCount++;
        }
      } else {
        console.log(`   ✅ ${columnName}: Added successfully`);
        successCount++;
      }
    } catch (e) {
      console.log(`   ⚠️ ${columnName}: ${e.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Migration result: ${successCount} success, ${errorCount} errors`);

  if (errorCount > 0) {
    console.log('\n⚠️ Some columns could not be added automatically.');
    console.log('   Please run the SQL migration manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/vyolbmzuezpoqtdgongz/sql');
    console.log('   2. Run the contents of: migrations/add_enhanced_product_columns.sql');
  }
}

runMigration().catch(console.error);
