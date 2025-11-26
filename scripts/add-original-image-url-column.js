const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';

console.log('🔗 Using Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function addOriginalImageUrlColumn() {
  console.log('🔄 Adding original_image_url column to product tables...');
  
  try {
    // Add column to wp_products table
    const { error: wpError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE wp_products 
        ADD COLUMN IF NOT EXISTS original_image_url TEXT;
      `
    });
    
    if (wpError) {
      console.log('⚠️  wp_products column might already exist or error occurred:', wpError.message);
    } else {
      console.log('✅ Added original_image_url column to wp_products');
    }
    
    // Add column to us_products table
    const { error: usError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE us_products 
        ADD COLUMN IF NOT EXISTS original_image_url TEXT;
      `
    });
    
    if (usError) {
      console.log('⚠️  us_products column might already exist or error occurred:', usError.message);
    } else {
      console.log('✅ Added original_image_url column to us_products');
    }
    
    console.log('🎉 Database schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
  }
}

// Run the script
if (require.main === module) {
  addOriginalImageUrlColumn();
}

module.exports = { addOriginalImageUrlColumn };
