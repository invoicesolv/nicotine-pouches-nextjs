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

    // Search param
    const search = url.searchParams.get('search') || '';

    // Correct table names
    const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const productTable = isUK ? 'wp_products' : 'us_products';

    let query = supabaseAdmin()
      .from(mappingTable)
      .select(`
        id, vendor_product, product_id, vendor_id, created_at, updated_at,
        product:${productTable}(id, name, image_url)
      `, { count: 'exact' })
      .eq('vendor_id', vendorId)
      .order('vendor_product', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.ilike('vendor_product', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching mappings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mappings' },
        { status: 500 }
      );
    }

    // Also get total vendor_products count for stats
    const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';

    const [totalVPResult, mappedCountResult] = await Promise.all([
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId),
      supabaseAdmin()
        .from(mappingTable)
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId),
    ]);

    const totalVendorProducts = totalVPResult.count || 0;
    const totalMapped = mappedCountResult.count || 0;

    const mappings = (data || []).map((m: any) => ({
      id: m.id,
      vendorProduct: m.vendor_product,
      productId: m.product_id,
      masterProduct: m.product ? {
        id: m.product.id,
        name: m.product.name,
        imageUrl: m.product.image_url,
      } : null,
      status: m.product_id ? 'mapped' : 'unmapped',
      createdAt: m.created_at,
    }));

    return NextResponse.json({
      mappings,
      stats: {
        totalMappings: count || 0,
        totalVendorProducts,
        mapped: totalMapped,
        unmapped: totalVendorProducts - totalMapped,
      },
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
