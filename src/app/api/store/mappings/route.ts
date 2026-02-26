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

    const { user } = authResult;
    const url = new URL(request.url);

    // Pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Search param
    const search = url.searchParams.get('search') || '';

    // Determine vendor type
    const isUK = !!user.vendor_id;
    const vendorId = isUK ? user.vendor_id : user.us_vendor_id;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    // Build query for vendor_mappings (UK) or us_vendor_mappings (US)
    const tableName = isUK ? 'vendor_mappings' : 'us_vendor_mappings';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
    const productJoinTable = isUK ? 'products' : 'us_products';

    let query = supabaseAdmin()
      .from(tableName)
      .select(`
        *,
        product:${productJoinTable}(id, name, slug, brand, nicotine_strength)
      `, { count: 'exact' })
      .eq(vendorIdColumn, vendorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter on vendor_product_name
    if (search) {
      query = query.ilike('vendor_product_name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching mappings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mappings' },
        { status: 500 }
      );
    }

    // Transform data to include mapping status
    const mappings = (data || []).map(mapping => ({
      id: mapping.id,
      vendorProductName: mapping.vendor_product_name,
      vendorProductUrl: mapping.vendor_product_url,
      masterProduct: mapping.product ? {
        id: mapping.product.id,
        name: mapping.product.name,
        slug: mapping.product.slug,
        brand: mapping.product.brand,
        nicotineStrength: mapping.product.nicotine_strength,
      } : null,
      status: mapping.product ? 'mapped' : 'unmapped',
      createdAt: mapping.created_at,
      updatedAt: mapping.updated_at,
    }));

    return NextResponse.json({
      mappings,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in mappings API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
