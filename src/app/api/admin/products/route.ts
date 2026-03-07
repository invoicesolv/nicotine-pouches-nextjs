import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.CRAWLER_API_KEY || '';

function authenticateAdmin(request: NextRequest): boolean {
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!ADMIN_API_KEY || !apiKey) return false;
  return apiKey === ADMIN_API_KEY;
}

export async function GET(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'UK';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';

    const tableName = region === 'UK' ? 'wp_products' : 'us_products';
    const nameField = region === 'UK' ? 'name' : 'product_title';

    let query = supabaseAdmin()
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('id', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike(nameField, `%${search}%`);
    }

    // Apply brand filter
    if (brand) {
      query = query.ilike(region === 'UK' ? 'name' : 'brand', `${brand}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
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
    console.error('Error in products GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { region = 'UK', ...productData } = body;

    const tableName = region === 'UK' ? 'wp_products' : 'us_products';

    // Validate required fields based on region
    if (region === 'UK') {
      if (!productData.name) {
        return NextResponse.json(
          { error: 'Product name is required' },
          { status: 400 }
        );
      }
    } else {
      if (!productData.product_title) {
        return NextResponse.json(
          { error: 'Product title is required' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in products POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, region = 'UK', ...productData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const tableName = region === 'UK' ? 'wp_products' : 'us_products';

    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in products PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    const tableName = region === 'UK' ? 'wp_products' : 'us_products';

    const { error } = await supabaseAdmin()
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in products DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

