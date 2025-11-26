#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting complete image migration process...\n');

try {
  // Step 1: Add original_image_url column to database
  console.log('📊 Step 1: Adding original_image_url column to database...');
  execSync('node scripts/add-original-image-url-column.js', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Database schema updated\n');

  // Step 2: Migrate images to local storage
  console.log('📦 Step 2: Migrating images to local storage...');
  execSync('node scripts/migrate-images-to-local.js', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Images migrated to local storage\n');

  // Step 3: Verify migration
  console.log('🔍 Step 3: Verifying migration...');
  const fs = require('fs');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const productsDir = path.join(uploadsDir, 'products');
  
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir);
    console.log(`📁 Found ${files.length} product images in local storage`);
  }
  
  if (fs.existsSync('image-mapping.json')) {
    const mapping = JSON.parse(fs.readFileSync('image-mapping.json', 'utf8'));
    console.log(`📋 Image mapping created with ${Object.keys(mapping.products).length} product mappings`);
  }

  console.log('\n🎉 Image migration completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Test your application to ensure images load correctly');
  console.log('2. Update any hardcoded image URLs in your code');
  console.log('3. Consider removing old Supabase storage images to save costs');
  console.log('4. Monitor performance improvements with local image serving');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
