import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { vendor_product, product_id, vendor_id, region = 'UK' } = await request.json();

    if (!vendor_product || !product_id || !vendor_id) {
      return NextResponse.json(
        { error: 'Vendor product name, product ID, and vendor ID are required' },
        { status: 400 }
      );
    }

    // Use correct table and field names based on region
    const tableName = region === 'UK' ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const vendorIdField = region === 'UK' ? 'vendor_id' : 'us_vendor_id';
    
    const insertData = region === 'UK' 
      ? {
          vendor_product,
          product_id: parseInt(product_id),
          vendor_id: parseInt(vendor_id)
        }
      : {
          vendor_product,
          product_id: parseInt(product_id),
          us_vendor_id: vendor_id
        };

    // Insert the mapping
    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting vendor product mapping:', error);
      return NextResponse.json(
        { error: 'Failed to create vendor product mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in vendor product mapping API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const productId = searchParams.get('product_id');
    const region = searchParams.get('region') || 'UK';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Use correct table and field names based on region
    const tableName = region === 'UK' ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const vendorIdField = region === 'UK' ? 'vendor_id' : 'us_vendor_id';
    const vendorTableName = region === 'UK' ? 'vendors' : 'us_vendors';
    const productTableName = region === 'UK' ? 'products' : 'us_products';

    let query = supabaseAdmin()
      .from(tableName)
      .select(`
        *,
        ${vendorTableName}!${tableName}_${vendorIdField}_fkey(name),
        ${productTableName}!${tableName}_product_id_fkey(name, brand, flavour)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (vendorId && vendorId !== 'all') {
      query = query.eq(vendorIdField, region === 'UK' ? parseInt(vendorId) : vendorId);
    }

    if (productId) {
      query = query.eq('product_id', parseInt(productId));
    }

    if (search) {
      query = query.or(`vendor_product.ilike.%${search}%,products.name.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor product mappings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendor product mappings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error in vendor product mappings GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const region = searchParams.get('region') || 'UK';

    if (!id) {
      return NextResponse.json(
        { error: 'Mapping ID is required' },
        { status: 400 }
      );
    }

    // Use correct table based on region
    const tableName = region === 'UK' ? 'vendor_product_mapping' : 'us_vendor_product_mapping';

    const { error } = await supabaseAdmin()
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor product mapping:', error);
      return NextResponse.json(
        { error: 'Failed to delete vendor product mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in vendor product mapping DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
