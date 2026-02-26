// Run this script with: node scripts/create-notification-tables.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating notification tables...\n');

  // Test connection by checking if tables exist
  const { data: stockCheck, error: stockError } = await supabase
    .from('stock_notifications')
    .select('id')
    .limit(1);

  if (stockError && stockError.code === '42P01') {
    console.log('❌ stock_notifications table does not exist');
    console.log('   Please create it in Supabase SQL Editor\n');
  } else if (stockError) {
    console.log('⚠️  stock_notifications error:', stockError.message);
  } else {
    console.log('✅ stock_notifications table exists');
  }

  const { data: priceCheck, error: priceError } = await supabase
    .from('price_alerts')
    .select('id')
    .limit(1);

  if (priceError && priceError.code === '42P01') {
    console.log('❌ price_alerts table does not exist');
    console.log('   Please create it in Supabase SQL Editor\n');
  } else if (priceError) {
    console.log('⚠️  price_alerts error:', priceError.message);
  } else {
    console.log('✅ price_alerts table exists');
  }

  console.log('\n--- SQL to run in Supabase SQL Editor ---\n');
  console.log(`
-- Stock notifications table
CREATE TABLE IF NOT EXISTS stock_notifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  product_name VARCHAR(500) NOT NULL,
  vendor_name VARCHAR(255),
  product_slug VARCHAR(500),
  notified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, product_name, vendor_name)
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  product_name VARCHAR(500),
  product_slug VARCHAR(500),
  current_price DECIMAL(10,2),
  target_price DECIMAL(10,2),
  product_image TEXT,
  vendor_name VARCHAR(255),
  notified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, product_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_notifications_email ON stock_notifications(email);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_product ON stock_notifications(product_name);
CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(email);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product ON price_alerts(product_name);
  `);
}

createTables().catch(console.error);
