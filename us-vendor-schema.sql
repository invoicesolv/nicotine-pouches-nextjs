-- US Vendor System Schema
-- Separate from UK system for better organization

-- Create US vendors table
CREATE TABLE IF NOT EXISTS us_vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  website_url VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  region VARCHAR(50) DEFAULT 'US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create US vendor products table (mapping US products to vendors)
CREATE TABLE IF NOT EXISTS us_vendor_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES us_vendors(id) ON DELETE CASCADE,
  us_product_id INTEGER NOT NULL REFERENCES us_products(id) ON DELETE CASCADE,
  price_1pack DECIMAL(10,2),
  price_3pack DECIMAL(10,2),
  price_5pack DECIMAL(10,2),
  price_10pack DECIMAL(10,2),
  price_20pack DECIMAL(10,2),
  price_25pack DECIMAL(10,2),
  price_30pack DECIMAL(10,2),
  price_50pack DECIMAL(10,2),
  stock_status VARCHAR(50) DEFAULT 'in_stock',
  product_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, us_product_id)
);

-- Create members/users table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  date_of_birth DATE,
  country VARCHAR(100) DEFAULT 'US',
  state VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create Shawn CDN table for members
CREATE TABLE IF NOT EXISTS shawn_cdn (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  cdn_key VARCHAR(255) UNIQUE NOT NULL,
  cdn_secret VARCHAR(500) NOT NULL,
  bandwidth_limit_gb INTEGER DEFAULT 100,
  bandwidth_used_gb DECIMAL(10,2) DEFAULT 0,
  storage_limit_gb INTEGER DEFAULT 10,
  storage_used_gb DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member preferences table
CREATE TABLE IF NOT EXISTS member_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  preferred_brands TEXT[],
  preferred_flavors TEXT[],
  preferred_strengths TEXT[],
  price_alerts_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  newsletter_subscription BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id)
);

-- Create member wishlist table
CREATE TABLE IF NOT EXISTS member_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  us_product_id INTEGER NOT NULL REFERENCES us_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, us_product_id)
);

-- Create member price alerts table
CREATE TABLE IF NOT EXISTS member_price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  us_product_id INTEGER NOT NULL REFERENCES us_products(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2),
  vendor_id UUID REFERENCES us_vendors(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_us_vendors_region ON us_vendors(region);
CREATE INDEX IF NOT EXISTS idx_us_vendors_active ON us_vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_us_vendor_products_vendor_id ON us_vendor_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_us_vendor_products_product_id ON us_vendor_products(us_product_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_country ON members(country);
CREATE INDEX IF NOT EXISTS idx_members_subscription ON members(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_shawn_cdn_member_id ON shawn_cdn(member_id);
CREATE INDEX IF NOT EXISTS idx_shawn_cdn_active ON shawn_cdn(is_active);
CREATE INDEX IF NOT EXISTS idx_member_preferences_member_id ON member_preferences(member_id);
CREATE INDEX IF NOT EXISTS idx_member_wishlist_member_id ON member_wishlist(member_id);
CREATE INDEX IF NOT EXISTS idx_member_price_alerts_member_id ON member_price_alerts(member_id);
CREATE INDEX IF NOT EXISTS idx_member_price_alerts_active ON member_price_alerts(is_active);

-- Enable Row Level Security
ALTER TABLE us_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE us_vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shawn_cdn ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to US vendors" ON us_vendors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to US vendor products" ON us_vendor_products
  FOR SELECT USING (true);

-- Create policies for member access
CREATE POLICY "Members can view their own data" ON members
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Members can view their own CDN data" ON shawn_cdn
  FOR ALL USING (auth.uid()::text = member_id::text);

CREATE POLICY "Members can view their own preferences" ON member_preferences
  FOR ALL USING (auth.uid()::text = member_id::text);

CREATE POLICY "Members can view their own wishlist" ON member_wishlist
  FOR ALL USING (auth.uid()::text = member_id::text);

CREATE POLICY "Members can view their own price alerts" ON member_price_alerts
  FOR ALL USING (auth.uid()::text = member_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_us_vendors_updated_at 
  BEFORE UPDATE ON us_vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_us_vendor_products_updated_at 
  BEFORE UPDATE ON us_vendor_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shawn_cdn_updated_at 
  BEFORE UPDATE ON shawn_cdn 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_preferences_updated_at 
  BEFORE UPDATE ON member_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_price_alerts_updated_at 
  BEFORE UPDATE ON member_price_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample US vendors
INSERT INTO us_vendors (name, website, website_url, contact_email, contact_phone, description, region) VALUES
  ('Prilla US', 'https://prilla.com/us', 'https://prilla.com/us', 'us@prilla.com', '+1-555-0123', 'Leading US nicotine pouches retailer', 'US'),
  ('Northerner US', 'https://northerner.com/us', 'https://northerner.com/us', 'us@northerner.com', '+1-555-0124', 'Premium nicotine pouches for US market', 'US'),
  ('SnusDirect US', 'https://snusdirect.com/us', 'https://snusdirect.com/us', 'us@snusdirect.com', '+1-555-0125', 'Direct from Sweden to US', 'US')
ON CONFLICT DO NOTHING;
