const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjY0NzQwMCwiZXhwIjoyMDUyMjIzNDAwfQ.8Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importZynProducts() {
  try {
    // Read the ZYN products data
    const zynData = JSON.parse(fs.readFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/zyn_products_data.json', 'utf8'));
    
    console.log(`Found ${zynData.length} ZYN products to import`);
    
    // Clear existing US products
    console.log('Clearing existing US products...');
    const { error: deleteError } = await supabase
      .from('us_products')
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (deleteError) {
      console.error('Error clearing existing products:', deleteError);
      return;
    }
    
    console.log('Existing products cleared');
    
    // Insert new products
    console.log('Inserting new products...');
    const { data, error } = await supabase
      .from('us_products')
      .insert(zynData);
    
    if (error) {
      console.error('Error inserting products:', error);
      return;
    }
    
    console.log(`Successfully imported ${zynData.length} products`);
    
    // Verify the import
    const { data: count, error: countError } = await supabase
      .from('us_products')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log(`Total products in database: ${count.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

importZynProducts();
