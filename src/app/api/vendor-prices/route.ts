import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    const region = searchParams.get('region') || 'UK';

    if (!productId && !productName) {
      return NextResponse.json({ error: 'Product ID or name is required' }, { status: 400 });
    }

    let vendorPrices: any[] = [];

    if (region === 'UK') {
      // First, get mappings for this product from vendor_product_mapping
      const { data: mappings, error: mappingError } = await supabase()
        .from('vendor_product_mapping')
        .select('vendor_product, vendor_id')
        .eq('product_id', parseInt(productId || '0'));

      if (mappingError) {
        console.error('Error fetching mappings:', mappingError);
      }

      if (mappings && mappings.length > 0) {
        // Get vendor products using the mappings
        const { data: vpData, error: vpError } = await supabase()
          .from('vendor_products')
          .select(`
            name,
            price_1pack,
            price_3pack,
            price_5pack,
            updated_at,
            vendors!inner(name)
          `)
          .in('name', mappings.map((m: any) => m.vendor_product))
          .in('vendor_id', mappings.map((m: any) => m.vendor_id))
          .not('price_1pack', 'is', null)
          .gt('price_1pack', 0)
          .order('price_1pack', { ascending: true });

        if (!vpError && vpData) {
          vendorPrices = vpData.map((vp: any) => ({
            vendor_name: vp.vendors?.name || 'Unknown Vendor',
            pack_price: vp.price_1pack || 0,
            pack_size: 20,
            price_per_pouch: (vp.price_1pack || 0) / 20,
            last_updated: vp.updated_at,
            in_stock: true
          }));
        }
      }

      // Fallback: search by product name if no mappings found
      if (vendorPrices.length === 0 && productName) {
        const searchTerm = productName.toLowerCase();
        const { data: vpData, error: vpError } = await supabase()
          .from('vendor_products')
          .select(`
            name,
            price_1pack,
            updated_at,
            vendors!inner(name)
          `)
          .ilike('name', `%${searchTerm}%`)
          .not('price_1pack', 'is', null)
          .gt('price_1pack', 0)
          .order('price_1pack', { ascending: true })
          .limit(10);

        if (!vpError && vpData) {
          vendorPrices = vpData.map((vp: any) => ({
            vendor_name: vp.vendors?.name || 'Unknown Vendor',
            pack_price: vp.price_1pack || 0,
            pack_size: 20,
            price_per_pouch: (vp.price_1pack || 0) / 20,
            last_updated: vp.updated_at,
            in_stock: true
          }));
        }
      }
    } else {
      // US region
      const { data: vpData, error: vpError } = await supabase()
        .from('us_vendor_products_new')
        .select(`
          product_title,
          price_1pack,
          updated_at,
          us_vendors!inner(name)
        `)
        .ilike('product_title', `%${productName || ''}%`)
        .not('price_1pack', 'is', null)
        .gt('price_1pack', 0)
        .order('price_1pack', { ascending: true })
        .limit(10);

      if (!vpError && vpData) {
        vendorPrices = vpData.map((vp: any) => ({
          vendor_name: vp.us_vendors?.name || 'Unknown Vendor',
          pack_price: vp.price_1pack || 0,
          pack_size: 20,
          price_per_pouch: (vp.price_1pack || 0) / 20,
          last_updated: vp.updated_at,
          in_stock: true
        }));
      }
    }

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
