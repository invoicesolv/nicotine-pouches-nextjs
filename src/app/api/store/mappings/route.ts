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

    // UK: integer vendor_id, US: uuid us_vendor_id
    const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
    const vendorIdValue = isUK ? vendor.realVendorId : vendor.usVendorUuid;
    const productTable = isUK ? 'wp_products' : 'us_products';

    // Pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';

    // Fetch mappings without PostgREST join (no FK exists)
    let query = supabaseAdmin()
      .from(mappingTable)
      .select('id, vendor_product, product_id, created_at, updated_at', { count: 'exact' })
      .eq(vendorIdColumn, vendorIdValue)
      .order('vendor_product', { ascending: true })
      .range(offset, offset + limit - 1);

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

    // Batch-fetch master products for mapped items
    const productIds = (data || [])
      .map((m: any) => m.product_id)
      .filter((id: any) => id != null);

    let productsMap: Record<number, { id: number; name: string; image_url: string | null }> = {};

    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin()
        .from(productTable)
        .select('id, name, image_url')
        .in('id', productIds);

      if (products) {
        for (const p of products) {
          productsMap[p.id] = p;
        }
      }
    }

    // Get total vendor_products count for stats
    const [totalVPResult, mappedCountResult] = await Promise.all([
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue),
      supabaseAdmin()
        .from(mappingTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue),
    ]);

    const totalVendorProducts = totalVPResult.count || 0;
    const totalMapped = mappedCountResult.count || 0;

    const mappings = (data || []).map((m: any) => {
      const product = productsMap[m.product_id];
      return {
        id: m.id,
        vendorProduct: m.vendor_product,
        productId: m.product_id,
        masterProduct: product ? {
          id: product.id,
          name: product.name,
          imageUrl: product.image_url,
        } : null,
        status: m.product_id ? 'mapped' : 'unmapped',
        createdAt: m.created_at,
      };
    });

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
