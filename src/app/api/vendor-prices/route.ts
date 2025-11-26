import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const region = searchParams.get('region') || 'UK'; // Default to UK

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Use correct table based on region
    const tableName = region === 'US' ? 'us_vendor_products_new' : 'vendor_products';
    
    // Fetch real vendor prices from the appropriate table
    const { data: vendorMappings, error: mappingError } = await supabase()
      .from(tableName)
      .select(`
        ${region === 'US' ? 'us_vendors!inner(name)' : 'vendors!inner(name)'},
        name,
        price_1pack,
        price_3pack,
        price_5pack,
        created_at
      `)
      .not('price_1pack', 'is', null)
      .gt('price_1pack', 0)
      .order('price_1pack', { ascending: true })
      .limit(10); // Limit to top 10 lowest prices

    if (mappingError) {
      console.error('Error fetching vendor mappings:', mappingError);
      return NextResponse.json({ error: 'Failed to fetch vendor prices' }, { status: 500 });
    }

    // Transform the data to match our expected format
    const vendorPrices = vendorMappings?.map((mapping: any) => {
      // Handle both UK and US vendor table structures
      const vendorKey = region === 'US' ? 'us_vendors' : 'vendors';
      const vendorName = Array.isArray(mapping[vendorKey]) 
        ? (mapping[vendorKey] as any[])[0]?.name || 'Unknown Vendor'
        : (mapping[vendorKey] as any)?.name || 'Unknown Vendor';
      
      // Use price_1pack as the default price (20 pouches)
      const packPrice = mapping.price_1pack || 0;
      
      return {
        vendor_name: vendorName,
        pack_price: packPrice,
        pack_size: 20, // Default pack size
        price_per_pouch: packPrice / 20,
        last_updated: mapping.created_at,
        in_stock: true // Assume in stock since we don't have stock_status column
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
