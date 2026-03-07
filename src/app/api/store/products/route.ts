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

    if (!vendor?.realVendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    const vendorId = vendor.realVendorId;
    const isUK = vendor.country === 'uk';

    // Pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Search/filter params
    const search = url.searchParams.get('search') || '';
    const stockFilter = url.searchParams.get('inStock');

    // vendor_products for UK, us_vendor_products_new for US
    const tableName = isUK ? 'vendor_products' : 'us_vendor_products_new';

    let query = supabaseAdmin()
      .from(tableName)
      .select('id, vendor_id, name, brand, category, price_1pack, price_3pack, price_5pack, price_10pack, stock_status, url, created_at, updated_at', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply stock filter
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
