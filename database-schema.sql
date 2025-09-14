-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  api_endpoint VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_products table
CREATE TABLE IF NOT EXISTS vendor_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_name VARCHAR(500) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  stock_status VARCHAR(50) DEFAULT 'in_stock',
  product_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at);
CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor_id ON vendor_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_products_created_at ON vendor_products(created_at);
CREATE INDEX IF NOT EXISTS idx_vendor_products_product_name ON vendor_products(product_name);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to vendors" ON vendors
  FOR SELECT USING (status = 'active');

CREATE POLICY "Allow public read access to vendor products" ON vendor_products
  FOR SELECT USING (true);

-- Create policies for admin access (you may want to add authentication)
CREATE POLICY "Allow all operations on vendors for authenticated users" ON vendors
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on vendor products for authenticated users" ON vendor_products
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_products_updated_at 
  BEFORE UPDATE ON vendor_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample vendors
INSERT INTO vendors (name, website, api_endpoint, status) VALUES
  ('Vendor A', 'https://vendor-a.com', 'https://vendor-a.com/api/products', 'active'),
  ('Vendor B', 'https://vendor-b.com', 'https://vendor-b.com/api/products', 'active'),
  ('Vendor C', 'https://vendor-c.com', 'https://vendor-c.com/api/products', 'inactive')
ON CONFLICT DO NOTHING;
