import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { vendor } = authResult;
    const url = new URL(request.url);

    if (!vendor?.realVendorId && !vendor?.usVendorUuid) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    const isUK = vendor.country === 'uk';

    // UK: integer vendor_id column, US: uuid us_vendor_id column
    const tableName = isUK ? 'vendor_products' : 'us_vendor_products_new';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
    const vendorIdValue = isUK ? vendor.realVendorId : vendor.usVendorUuid;

    // Pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Search/filter params
    const search = url.searchParams.get('search') || '';
    const stockFilter = url.searchParams.get('inStock');

    let query = supabaseAdmin()
      .from(tableName)
      .select('id, name, brand, price_1pack, price_3pack, price_5pack, price_10pack, stock_status, url, created_at, updated_at', { count: 'exact' })
      .eq(vendorIdColumn, vendorIdValue)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (stockFilter === 'true') {
      query = query.eq('stock_status', 'instock');
    } else if (stockFilter === 'false') {
      query = query.neq('stock_status', 'instock');
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
