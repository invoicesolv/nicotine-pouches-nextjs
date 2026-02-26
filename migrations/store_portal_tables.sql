-- Store Portal Database Schema
-- Run this migration to create the necessary tables for the store portal

-- Store Users table
CREATE TABLE IF NOT EXISTS store_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  vendor_id UUID REFERENCES vendors(id),      -- UK vendor reference (UUID)
  us_vendor_id UUID,                          -- US vendor reference (UUID, no FK as table may not exist)
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
  vendor_id UUID REFERENCES vendors(id),
  us_vendor_id UUID,
  invite_code VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255),  -- Optional: pre-fill email
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_vendor_id ON store_users(vendor_id);
CREATE INDEX IF NOT EXISTS idx_store_users_us_vendor_id ON store_users(us_vendor_id);

CREATE INDEX IF NOT EXISTS idx_store_sessions_token ON store_sessions(token);
CREATE INDEX IF NOT EXISTS idx_store_sessions_store_user_id ON store_sessions(store_user_id);
CREATE INDEX IF NOT EXISTS idx_store_sessions_expires_at ON store_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_store_invites_invite_code ON store_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_store_invites_vendor_id ON store_invites(vendor_id);
CREATE INDEX IF NOT EXISTS idx_store_invites_us_vendor_id ON store_invites(us_vendor_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on store tables
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
CREATE POLICY "Service role has full access to store_users"
  ON store_users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to store_sessions"
  ON store_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to store_invites"
  ON store_invites FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_store_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_users_updated_at
  BEFORE UPDATE ON store_users
  FOR EACH ROW
  EXECUTE FUNCTION update_store_users_updated_at();

-- Clean up expired sessions (run periodically via cron)
-- DELETE FROM store_sessions WHERE expires_at < NOW();

-- Optional: Vendor Analytics tables if they don't exist
-- These may already exist in your database

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

CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor_date ON vendor_analytics(vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_us_vendor_analytics_vendor_date ON us_vendor_analytics(us_vendor_id, date);
