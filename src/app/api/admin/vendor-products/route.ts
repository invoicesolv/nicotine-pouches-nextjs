import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'UK';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const vendorId = searchParams.get('vendor_id') || '';

    const tableName = region === 'UK' ? 'vendor_products' : 'us_vendor_products_new';
    const vendorIdField = region === 'UK' ? 'vendor_id' : 'us_vendor_id';
    const productNameField = region === 'UK' ? 'name' : 'name';

    let query = supabaseAdmin()
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('id', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike(productNameField, `%${search}%`);
    }

    // Apply vendor filter
    if (vendorId) {
      query = query.eq(vendorIdField, vendorId);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendor products' },
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
    console.error('Error in vendor products GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region = 'UK', ...productData } = body;

    const tableName = region === 'UK' ? 'vendor_products' : 'us_vendor_products_new';
    const vendorIdField = region === 'UK' ? 'vendor_id' : 'us_vendor_id';

    // Validate required fields
    if (!productData[vendorIdField]) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    if (!productData.name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor product:', error);
      return NextResponse.json(
        { error: 'Failed to create vendor product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in vendor products POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, region = 'UK', ...productData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const tableName = region === 'UK' ? 'vendor_products' : 'us_vendor_products_new';

    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor product:', error);
      return NextResponse.json(
        { error: 'Failed to update vendor product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in vendor products PUT API:', error);
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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const tableName = region === 'UK' ? 'vendor_products' : 'us_vendor_products_new';

    const { error } = await supabaseAdmin()
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor product:', error);
      return NextResponse.json(
        { error: 'Failed to delete vendor product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in vendor products DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

