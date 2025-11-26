const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWwwUrls() {
  console.log('Fixing www URLs in database...');
  
  try {
    // Update wp_products table
    console.log('Updating wp_products...');
    const { data: wpData, error: wpError } = await supabase
      .from('wp_products')
      .update({ 
        page_url: supabase.raw("REPLACE(page_url, 'https://www.nicotine-pouches.org', 'https://nicotine-pouches.org')")
      })
      .like('page_url', '%www.nicotine-pouches.org%');
    
    if (wpError) {
      console.error('Error updating wp_products:', wpError);
    } else {
      console.log('Updated wp_products successfully');
    }
    
    // Update us_products table
    console.log('Updating us_products...');
    const { data: usData, error: usError } = await supabase
      .from('us_products')
      .update({ 
        page_url: supabase.raw("REPLACE(page_url, 'https://www.nicotine-pouches.org', 'https://nicotine-pouches.org')")
      })
      .like('page_url', '%www.nicotine-pouches.org%');
    
    if (usError) {
      console.error('Error updating us_products:', usError);
    } else {
      console.log('Updated us_products successfully');
    }
    
    // Update blog_posts table
    console.log('Updating blog_posts...');
    const { data: blogData, error: blogError } = await supabase
      .from('blog_posts')
      .update({ 
        page_url: supabase.raw("REPLACE(page_url, 'https://www.nicotine-pouches.org', 'https://nicotine-pouches.org')")
      })
      .like('page_url', '%www.nicotine-pouches.org%');
    
    if (blogError) {
      console.error('Error updating blog_posts:', blogError);
    } else {
      console.log('Updated blog_posts successfully');
    }
    
    console.log('All www URLs have been fixed!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixWwwUrls();

