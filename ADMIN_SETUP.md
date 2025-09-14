# Admin System Setup

This document explains how to set up and use the vendor management admin system.

## Features

- **Admin Authentication**: Secure login with admin key `9503283252`
- **Vendor Management**: Add, edit, and manage vendors
- **CSV Upload**: Upload vendor product data via CSV files
- **Product Integration**: Connect vendor products to the comparison system
- **Real-time Pricing**: Display actual vendor prices in the comparison table

## Setup Instructions

### 1. Database Setup

First, run the database schema setup:

```bash
# Install dependencies if not already done
npm install

# Set up the database schema
node scripts/setup-database.js
```

This will create the necessary tables:
- `vendors` - Store vendor information
- `vendor_products` - Store vendor product data with pricing

### 2. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Access Admin Panel

1. Navigate to `/admin/login`
2. Enter admin key: `9503283252`
3. You'll be redirected to `/admin/9503283252`

## Admin Panel Features

### Vendors Tab
- View all vendors
- Add new vendors with name, website, and API endpoint
- Toggle vendor status (active/inactive)
- View vendor products

### Products Tab
- View all vendor products
- See product details including pricing
- Access vendor product URLs

### CSV Upload Tab
- Upload CSV files with vendor product data
- Required columns: `product_name`, `price`, `stock_status`, `product_url`, `image_url`
- Products are automatically linked to active vendors

## CSV Format

Your CSV file should have the following columns:

```csv
product_name,price,stock_status,product_url,image_url
"ZYN Cool Mint 6mg",3.99,in_stock,https://vendor.com/zym-cool-mint,https://vendor.com/images/zym-cool-mint.jpg
"Velo Fresh Mint 4mg",2.99,in_stock,https://vendor.com/velo-fresh-mint,https://vendor.com/images/velo-fresh-mint.jpg
```

## API Endpoints

### Vendors
- `GET /api/vendors` - Get all active vendors
- `POST /api/vendors` - Create new vendor

### Vendor Products
- `GET /api/vendor-products` - Get vendor products
- `POST /api/vendor-products` - Create vendor product

### Products (with vendor integration)
- `GET /api/products` - Get products with vendor pricing

### Admin
- `POST /api/admin/upload-csv` - Upload CSV file

## Integration with Comparison System

The admin system automatically integrates with the existing comparison system:

1. **Real Pricing**: Vendor products provide actual pricing data
2. **Store Count**: Number of vendors selling each product
3. **Product Matching**: Automatic matching between main products and vendor products
4. **Dynamic Updates**: Changes in admin panel reflect immediately in comparison

## Security Notes

- Admin key is stored in localStorage (consider implementing proper authentication for production)
- All database operations use Supabase RLS policies
- CSV uploads are validated before processing

## Troubleshooting

### Database Issues
- Ensure Supabase credentials are correct
- Check that the database schema was created successfully
- Verify RLS policies are enabled

### Upload Issues
- Check CSV format matches required columns
- Ensure file is under size limits
- Verify vendor exists before uploading products

### Integration Issues
- Check that products are being matched correctly
- Verify vendor status is 'active'
- Ensure API endpoints are accessible
