-- Create unmapped_products table for tracking products found by scrapers that don't match existing products
CREATE TABLE IF NOT EXISTS unmapped_products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(500) NOT NULL,
    source_vendor VARCHAR(255) NOT NULL,
    source_vendor_id INTEGER REFERENCES vendors(id),
    source_url TEXT,
    source_prices JSONB,
    other_stores JSONB DEFAULT '[]',
    total_stores INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, mapped
    mapped_product_id INTEGER REFERENCES wp_products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_unmapped_products_status ON unmapped_products(status);
CREATE INDEX IF NOT EXISTS idx_unmapped_products_source_vendor ON unmapped_products(source_vendor);
CREATE INDEX IF NOT EXISTS idx_unmapped_products_total_stores ON unmapped_products(total_stores DESC);
CREATE INDEX IF NOT EXISTS idx_unmapped_products_created_at ON unmapped_products(created_at DESC);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_unmapped_products_unique
ON unmapped_products(product_name, source_vendor);

-- Add comment explaining the table
COMMENT ON TABLE unmapped_products IS 'Stores products found by scrapers that do not match any existing products in wp_products. Used for review and approval workflow.';

COMMENT ON COLUMN unmapped_products.other_stores IS 'JSON array of other stores selling similar products with match confidence scores';
COMMENT ON COLUMN unmapped_products.source_prices IS 'JSON object with price tiers (1-pack, 3-pack, etc.)';
COMMENT ON COLUMN unmapped_products.status IS 'Workflow status: pending (needs review), approved (created as new product), rejected (not added), mapped (linked to existing product)';
