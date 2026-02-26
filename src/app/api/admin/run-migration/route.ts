import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin API key for authentication
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.CRAWLER_API_KEY || '';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

function authenticateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '').trim();

  // Allow if ADMIN_API_KEY matches or use a secret header
  const secretHeader = request.headers.get('x-migration-secret');

  if (secretHeader === 'run-store-portal-migration-2024') {
    return true;
  }

  if (!ADMIN_API_KEY || !apiKey) {
    return false;
  }

  return apiKey === ADMIN_API_KEY;
}

export async function POST(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  const results: { step: string; success: boolean; error?: string }[] = [];

  // Migration steps - we'll create tables using raw SQL via pg_execute
  // Since supabase-js doesn't support raw SQL, we need to use a workaround
  // We'll create a stored procedure first, then use it

  try {
    // Step 1: Create store_users table
    // Using RPC to execute SQL
    const createUsersResult = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        // This won't work directly - we need to use the SQL editor
      }),
    });

    // Since direct SQL isn't possible via REST, let's check if tables exist
    // and provide instructions

    const tables = ['store_users', 'store_sessions', 'store_invites', 'vendor_analytics', 'us_vendor_analytics'];
    const tableStatus: Record<string, string> = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('id').limit(1);

      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        tableStatus[table] = 'missing';
      } else if (error) {
        tableStatus[table] = `error: ${error.message}`;
      } else {
        tableStatus[table] = 'exists';
      }
    }

    const missingTables = Object.entries(tableStatus)
      .filter(([_, status]) => status === 'missing')
      .map(([table]) => table);

    if (missingTables.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All tables already exist',
        tableStatus,
      });
    }

    // Tables are missing - we need to create them via Supabase SQL Editor
    // Return the SQL to run
    const sql = `
-- Store Portal Database Schema
-- Run this in Supabase SQL Editor

-- Store Users table
CREATE TABLE IF NOT EXISTS store_users (
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
);

-- Store Sessions table
CREATE TABLE IF NOT EXISTS store_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Invites table
CREATE TABLE IF NOT EXISTS store_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  us_vendor_id UUID REFERENCES us_vendors(id),
  invite_code VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_vendor_id ON store_users(vendor_id);
CREATE INDEX IF NOT EXISTS idx_store_sessions_token ON store_sessions(token);
CREATE INDEX IF NOT EXISTS idx_store_invites_invite_code ON store_invites(invite_code);

-- Enable RLS
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for service role)
CREATE POLICY "Allow all for store_users" ON store_users FOR ALL USING (true);
CREATE POLICY "Allow all for store_sessions" ON store_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for store_invites" ON store_invites FOR ALL USING (true);

-- Vendor Analytics (if not exists)
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, date)
);

CREATE TABLE IF NOT EXISTS us_vendor_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  us_vendor_id UUID REFERENCES us_vendors(id),
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(us_vendor_id, date)
);
    `.trim();

    return NextResponse.json({
      success: false,
      message: `${missingTables.length} tables need to be created. Run the SQL in Supabase SQL Editor.`,
      missingTables,
      tableStatus,
      sqlEditorUrl: 'https://supabase.com/dashboard/project/vyolbmzuezpoqtdgongz/sql',
      sql,
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check table status without authentication
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const tables = ['store_users', 'store_sessions', 'store_invites', 'vendor_analytics', 'us_vendor_analytics'];
  const tableStatus: Record<string, string> = {};

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);

      if (error?.code === '42P01' || error?.message?.includes('does not exist') || error?.message?.includes('schema cache')) {
        tableStatus[table] = 'missing';
      } else if (error) {
        tableStatus[table] = `error: ${error.code || error.message}`;
      } else {
        tableStatus[table] = 'exists';
      }
    } catch {
      tableStatus[table] = 'error';
    }
  }

  const allExist = Object.values(tableStatus).every(s => s === 'exists');

  return NextResponse.json({
    allTablesExist: allExist,
    tableStatus,
    sqlEditorUrl: allExist ? null : 'https://supabase.com/dashboard/project/vyolbmzuezpoqtdgongz/sql',
  });
}
