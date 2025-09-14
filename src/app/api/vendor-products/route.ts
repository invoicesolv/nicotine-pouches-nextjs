import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase()
      .from('vendor_products')
      .select(`
        *,
        vendors (
          id,
          name,
          website
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vendor_id, 
      name, 
      brand, 
      url, 
      price_1pack, 
      price_3pack, 
      price_5pack, 
      price_10pack, 
      price_20pack, 
      price_25pack, 
      price_30pack, 
      price_50pack 
    } = body;

    if (!vendor_id || !name) {
      return NextResponse.json(
        { error: 'Vendor ID and product name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase()
      .from('vendor_products')
      .insert([{
        vendor_id,
        name,
        brand: brand || '',
        url: url || '',
        price_1pack: price_1pack || '',
        price_3pack: price_3pack || '',
        price_5pack: price_5pack || '',
        price_10pack: price_10pack || '',
        price_20pack: price_20pack || '',
        price_25pack: price_25pack || '',
        price_30pack: price_30pack || '',
        price_50pack: price_50pack || ''
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Error creating vendor product:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor product' },
      { status: 500 }
    );
  }
}
