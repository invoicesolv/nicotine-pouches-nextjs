#!/usr/bin/env node
/**
 * Run Store Portal Database Migration
 * Creates store_users, store_sessions, store_invites tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrations = [
  // Create store_users table
  `CREATE TABLE IF NOT EXISTS store_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id),
    us_vendor_id UUID REFERENCES us_vendors(id),
    role VARCHAR(50) DEFAULT 'store_owner',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '{"can_view_analytics": true, "can_export_data": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // Create store_sessions table
  `CREATE TABLE IF NOT EXISTS store_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // Create store_invites table
  `CREATE TABLE IF NOT EXISTS store_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    us_vendor_id UUID REFERENCES us_vendors(id),
    invite_code VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_store_users_vendor_id ON store_users(vendor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_store_users_us_vendor_id ON store_users(us_vendor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_store_sessions_token ON store_sessions(token)`,
  `CREATE INDEX IF NOT EXISTS idx_store_sessions_store_user_id ON store_sessions(store_user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_store_sessions_expires_at ON store_sessions(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_store_invites_invite_code ON store_invites(invite_code)`,
  `CREATE INDEX IF NOT EXISTS idx_store_invites_vendor_id ON store_invites(vendor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_store_invites_us_vendor_id ON store_invites(us_vendor_id)`,

  // Enable RLS
  `ALTER TABLE store_users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE store_sessions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY`,

  // Create RLS policies (drop first if exists to avoid errors)
  `DROP POLICY IF EXISTS "Service role has full access to store_users" ON store_users`,
  `CREATE POLICY "Service role has full access to store_users" ON store_users FOR ALL USING (true)`,

  `DROP POLICY IF EXISTS "Service role has full access to store_sessions" ON store_sessions`,
  `CREATE POLICY "Service role has full access to store_sessions" ON store_sessions FOR ALL USING (true)`,

  `DROP POLICY IF EXISTS "Service role has full access to store_invites" ON store_invites`,
  `CREATE POLICY "Service role has full access to store_invites" ON store_invites FOR ALL USING (true)`,

  // Create trigger function
  `CREATE OR REPLACE FUNCTION update_store_users_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  // Create trigger (drop first if exists)
  `DROP TRIGGER IF EXISTS store_users_updated_at ON store_users`,
  `CREATE TRIGGER store_users_updated_at
    BEFORE UPDATE ON store_users
    FOR EACH ROW
    EXECUTE FUNCTION update_store_users_updated_at()`,

  // Create vendor_analytics tables if they don't exist
  `CREATE TABLE IF NOT EXISTS vendor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, date)
  )`,

  `CREATE TABLE IF NOT EXISTS us_vendor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    us_vendor_id UUID REFERENCES us_vendors(id),
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(us_vendor_id, date)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor_date ON vendor_analytics(vendor_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_us_vendor_analytics_vendor_date ON us_vendor_analytics(us_vendor_id, date)`,
];

async function runMigrations() {
  console.log('Starting Store Portal database migration...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    const shortSql = sql.substring(0, 60).replace(/\s+/g, ' ').trim();

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Try direct query if RPC not available
        const { error: directError } = await supabase.from('_migrations_log').select('id').limit(0);

        // Fall back to using raw SQL via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql_query: sql }),
        });

        if (!response.ok) {
          throw new Error(error?.message || 'Failed to execute SQL');
        }
      }

      console.log(`✅ [${i + 1}/${migrations.length}] ${shortSql}...`);
      successCount++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${migrations.length}] ${shortSql}...`);
      console.error(`   Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Migration complete: ${successCount} successful, ${errorCount} failed`);

  if (errorCount > 0) {
    console.log('\nNote: Some errors may be expected (e.g., objects already exist).');
    console.log('Please verify the tables were created in Supabase dashboard.');
  }
}

// Alternative: Run SQL directly via Supabase SQL Editor API
async function runMigrationsDirect() {
  console.log('Running Store Portal database migration via direct SQL...\n');

  const fullSql = migrations.join(';\n\n');

  try {
    // Use the Supabase Management API or SQL Editor
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal',
      },
    });

    console.log('Note: Direct SQL execution via REST API may not be available.');
    console.log('Please run the SQL manually in Supabase SQL Editor.');
    console.log('\nSQL file location: migrations/store_portal_tables.sql');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Check if tables exist
async function checkTables() {
  console.log('\nChecking if tables exist...\n');

  const tables = ['store_users', 'store_sessions', 'store_invites'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);

      if (error && error.code === '42P01') {
        console.log(`❌ ${table}: Does not exist`);
      } else if (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists`);
      }
    } catch (err) {
      console.log(`⚠️  ${table}: ${err.message}`);
    }
  }
}

async function main() {
  // First check if tables already exist
  await checkTables();

  console.log('\n' + '='.repeat(50));
  console.log('To complete the migration, please run the SQL in Supabase:');
  console.log('='.repeat(50));
  console.log('\n1. Go to: https://supabase.com/dashboard/project/vyolbmzuezpoqtdgongz/sql');
  console.log('2. Open file: migrations/store_portal_tables.sql');
  console.log('3. Copy and paste the SQL content');
  console.log('4. Click "Run" to execute\n');
}

main().catch(console.error);
