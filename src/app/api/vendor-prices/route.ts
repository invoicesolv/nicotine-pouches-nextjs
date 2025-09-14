import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch real vendor prices from our existing vendor_products table
    const { data: vendorMappings, error: mappingError } = await supabase()
      .from('vendor_products')
      .select(`
        vendors!inner(name),
        product_name,
        price,
        stock_status,
        created_at
      `)
      .eq('product_name', `Product ${productId}`) // This is a placeholder - adjust based on your actual product matching
      .eq('stock_status', 'in_stock')
      .order('price', { ascending: true });

    if (mappingError) {
      console.error('Error fetching vendor mappings:', mappingError);
      return NextResponse.json({ error: 'Failed to fetch vendor prices' }, { status: 500 });
    }

    // Transform the data to match our expected format
    const vendorPrices = vendorMappings?.map((mapping: any) => {
      const vendorName = Array.isArray(mapping.vendors) 
        ? (mapping.vendors as any[])[0]?.name || 'Unknown Vendor'
        : (mapping.vendors as any)?.name || 'Unknown Vendor';
      
      return {
        vendor_name: vendorName,
        pack_price: mapping.price,
        pack_size: 20, // Default pack size
        price_per_pouch: mapping.price / 20,
        last_updated: mapping.created_at,
        in_stock: mapping.stock_status === 'in_stock'
      };
    }) || [];

    // If no real data, return mock data for demonstration
    if (vendorPrices.length === 0) {
      const mockPrices = [
        {
          vendor_name: 'Northerner',
          pack_price: 15.99,
          pack_size: 20,
          price_per_pouch: 0.80,
          last_updated: new Date().toISOString(),
          in_stock: true
        },
        {
          vendor_name: 'SnusDirect',
          pack_price: 16.49,
          pack_size: 20,
          price_per_pouch: 0.82,
          last_updated: new Date().toISOString(),
          in_stock: true
        },
        {
          vendor_name: 'SnusViking',
          pack_price: 14.99,
          pack_size: 20,
          price_per_pouch: 0.75,
          last_updated: new Date().toISOString(),
          in_stock: true
        },
        {
          vendor_name: 'TwoWombats',
          pack_price: 17.99,
          pack_size: 20,
          price_per_pouch: 0.90,
          last_updated: new Date().toISOString(),
          in_stock: true
        }
      ];

      return NextResponse.json({
        success: true,
        prices: mockPrices,
        message: 'Using mock data - no real vendor prices found'
      });
    }

    return NextResponse.json({
      success: true,
      prices: vendorPrices,
      message: 'Real vendor prices fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching vendor prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor prices' },
      { status: 500 }
    );
  }
}
