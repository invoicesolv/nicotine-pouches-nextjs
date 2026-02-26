#!/usr/bin/env node
/**
 * Store Portal Database Migration
 * Connects directly to PostgreSQL to run migrations
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase PostgreSQL connection
// Format: postgres://user:password@host:port/database
const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres.vyolbmzuezpoqtdgongz:FqBLjuLEZVzBvKZC@aws-0-eu-north-1.pooler.supabase.com:6543/postgres';

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

  // Create RLS policies
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for store_users' AND tablename = 'store_users') THEN
      CREATE POLICY "Allow all for store_users" ON store_users FOR ALL USING (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for store_sessions' AND tablename = 'store_sessions') THEN
      CREATE POLICY "Allow all for store_sessions" ON store_sessions FOR ALL USING (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for store_invites' AND tablename = 'store_invites') THEN
      CREATE POLICY "Allow all for store_invites" ON store_invites FOR ALL USING (true);
    END IF;
  END $$`,

  // Create trigger function
  `CREATE OR REPLACE FUNCTION update_store_users_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  // Create trigger
  `DROP TRIGGER IF EXISTS store_users_updated_at ON store_users`,
  `CREATE TRIGGER store_users_updated_at
    BEFORE UPDATE ON store_users
    FOR EACH ROW
    EXECUTE FUNCTION update_store_users_updated_at()`,

  // Create vendor_analytics if not exists
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
  console.log('Connecting to Supabase PostgreSQL...\n');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected successfully!\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      const shortSql = sql.substring(0, 60).replace(/\s+/g, ' ').trim();

      try {
        await client.query(sql);
        console.log(`✅ [${i + 1}/${migrations.length}] ${shortSql}...`);
        successCount++;
      } catch (err) {
        // Some errors are expected (e.g., already exists)
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`⏭️  [${i + 1}/${migrations.length}] ${shortSql}... (already exists)`);
          successCount++;
        } else {
          console.error(`❌ [${i + 1}/${migrations.length}] ${shortSql}...`);
          console.error(`   Error: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Migration complete: ${successCount} successful, ${errorCount} failed`);

    // Verify tables exist
    console.log('\nVerifying tables...\n');

    const tables = ['store_users', 'store_sessions', 'store_invites'];
    for (const table of tables) {
      try {
        const result = await client.query(
          `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = $1`,
          [table]
        );
        if (result.rows[0].count > 0) {
          console.log(`✅ ${table}: Created`);
        } else {
          console.log(`❌ ${table}: Not found`);
        }
      } catch (err) {
        console.log(`⚠️  ${table}: ${err.message}`);
      }
    }

  } catch (err) {
    console.error('Connection error:', err.message);
    console.error('\nMake sure the DATABASE_URL environment variable is set correctly.');
    console.error('You can find it in Supabase Dashboard > Settings > Database > Connection string');
  } finally {
    await client.end();
  }
}

runMigrations().catch(console.error);
