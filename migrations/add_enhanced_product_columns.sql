-- Migration: Add enhanced product description columns to wp_products
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vyolbmzuezpoqtdgongz/sql

-- Enhanced descriptions
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS description_short TEXT;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS description_long TEXT;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS content_original TEXT;

-- Brand information
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_name VARCHAR(100);
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_country VARCHAR(50);
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_parent_company VARCHAR(100);
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_founded INTEGER;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_founders TEXT;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_heritage TEXT;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_story TEXT;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_facts JSONB;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS brand_website VARCHAR(100);

-- Product details
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS pouch_format VARCHAR(20);
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS strength_category VARCHAR(20);
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS nicotine_mg INTEGER;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS flavour_category VARCHAR(50);

-- Usage information
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS usage_tips JSONB;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS usage_beginners JSONB;
ALTER TABLE wp_products ADD COLUMN IF NOT EXISTS usage_switchers JSONB;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wp_products_brand_name ON wp_products(brand_name);
CREATE INDEX IF NOT EXISTS idx_wp_products_strength ON wp_products(strength_category);
CREATE INDEX IF NOT EXISTS idx_wp_products_format ON wp_products(pouch_format);
CREATE INDEX IF NOT EXISTS idx_wp_products_flavour ON wp_products(flavour_category);
CREATE INDEX IF NOT EXISTS idx_wp_products_nicotine_mg ON wp_products(nicotine_mg);

-- Create brands lookup table (optional)
CREATE TABLE IF NOT EXISTS pouch_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(50),
  parent_company VARCHAR(100),
  founded INTEGER,
  founders TEXT,
  heritage TEXT,
  story TEXT,
  facts JSONB,
  website VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for brands table
ALTER TABLE pouch_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to pouch_brands"
  ON pouch_brands FOR SELECT TO PUBLIC USING (true);

COMMENT ON TABLE pouch_brands IS 'Nicotine pouch brand information including heritage and founder details';
COMMENT ON COLUMN wp_products.description_short IS 'Short product description for listings';
COMMENT ON COLUMN wp_products.description_long IS 'Full product description with usage info';
COMMENT ON COLUMN wp_products.brand_heritage IS 'Brand history and background story';
