import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the CSV file
    const csvText = await file.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Find required columns
    const productNameIndex = headers.indexOf('product_name');
    const priceIndex = headers.indexOf('price');
    const stockStatusIndex = headers.indexOf('stock_status');
    const productUrlIndex = headers.indexOf('product_url');
    const imageUrlIndex = headers.indexOf('image_url');
    
    if (productNameIndex === -1) {
      return NextResponse.json({ 
        error: 'CSV must contain a "product_name" column' 
      }, { status: 400 });
    }

    // Get the first active vendor (or create a default one)
    let { data: vendors, error: vendorError } = await supabase()
      .from('vendors')
      .select('id')
      .eq('status', 'active')
      .limit(1);

    if (vendorError) throw vendorError;

    let vendorId = vendors?.[0]?.id;
    
    // If no vendor exists, create a default one
    if (!vendorId) {
      const { data: newVendor, error: createVendorError } = await supabase()
        .from('vendors')
        .insert([{
          name: 'Default Vendor',
          website: 'https://example.com',
          api_endpoint: '',
          status: 'active'
        }])
        .select()
        .single();

      if (createVendorError) throw createVendorError;
      vendorId = newVendor.id;
    }

    // Process CSV data
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const productName = values[productNameIndex];
      
      if (!productName) continue;

      const product = {
        vendor_id: vendorId,
        product_name: productName,
        price: priceIndex !== -1 ? parseFloat(values[priceIndex]) || 0 : 0,
        stock_status: stockStatusIndex !== -1 ? values[stockStatusIndex] : 'in_stock',
        product_url: productUrlIndex !== -1 ? values[productUrlIndex] : '',
        image_url: imageUrlIndex !== -1 ? values[imageUrlIndex] : ''
      };

      products.push(product);
    }

    // Insert products into database
    const { data, error } = await supabase()
      .from('vendor_products')
      .insert(products)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      processed: products.length,
      inserted: data.length
    });

  } catch (error) {
    console.error('Error processing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}
