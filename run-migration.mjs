import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTable() {
  const { data, error } = await supabase
    .from('store_applications')
    .select('id')
    .limit(1);

  if (!error) {
    console.log('store_applications table already exists.');
  } else {
    console.log('Table status:', error.code, '-', error.message);
  }
}

checkTable().catch(console.error);
