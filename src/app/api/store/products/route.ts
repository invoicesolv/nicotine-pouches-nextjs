import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { user, vendor } = authResult;
    const url = new URL(request.url);

    // Pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Search/filter params
    const search = url.searchParams.get('search') || '';
    const inStock = url.searchParams.get('inStock');

    // Determine which table to query based on vendor type
    const isUK = !!user.vendor_id;
    const vendorId = isUK ? user.vendor_id : user.us_vendor_id;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    // Build query for vendor_products (UK) or us_vendor_products (US)
    const tableName = isUK ? 'vendor_products' : 'us_vendor_products';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';

    let query = supabaseAdmin()
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq(vendorIdColumn, vendorId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.ilike('product_name', `%${search}%`);
    }

    // Apply stock filter
    if (inStock === 'true') {
      query = query.eq('in_stock', true);
    } else if (inStock === 'false') {
      query = query.eq('in_stock', false);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
