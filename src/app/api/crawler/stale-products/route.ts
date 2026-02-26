import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// API Key for crawler authentication
const CRAWLER_API_KEY = (process.env.CRAWLER_API_KEY || '').trim();

// Authenticate the request
function authenticateRequest(request: NextRequest): boolean {
  if (!CRAWLER_API_KEY || CRAWLER_API_KEY.length === 0) {
    console.error('CRAWLER_API_KEY is not set in environment variables');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === CRAWLER_API_KEY) {
      return true;
    }
  }

  const apiKey = request.nextUrl.searchParams.get('apiKey');
  if (apiKey) {
    const trimmedKey = apiKey.trim();
    if (trimmedKey === CRAWLER_API_KEY) {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API key.' },
        { status: 401 }
      );
    }

    // Get days parameter (default 7 days)
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 7;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffIso = cutoffDate.toISOString();

    console.log(`Checking for products not updated since: ${cutoffIso}`);

    // Query vendor_products for stale entries (EU)
    const { data: staleEuProducts, error: euError } = await supabaseAdmin()
      .from('vendor_products')
      .select(`
        id,
        name,
        url,
        vendor_id,
        updated_at,
        stock_status,
        price_1pack,
        vendors!inner (
          id,
          name
        )
      `)
      .lt('updated_at', cutoffIso)
      .order('updated_at', { ascending: true })
      .limit(500);

    if (euError) {
      console.error('Error fetching stale EU products:', euError);
    }

    // Query us_vendor_products_new for stale entries (US)
    const { data: staleUsProducts, error: usError } = await supabaseAdmin()
      .from('us_vendor_products_new')
      .select(`
        id,
        name,
        url,
        us_vendor_id,
        updated_at,
        stock_status,
        price_1pack,
        us_vendors!inner (
          id,
          name
        )
      `)
      .lt('updated_at', cutoffIso)
      .order('updated_at', { ascending: true })
      .limit(500);

    if (usError) {
      console.error('Error fetching stale US products:', usError);
    }

    // Transform EU products
    const euProducts = (staleEuProducts || []).map((p: any) => ({
      id: p.id,
      product: p.name,
      vendor: p.vendors?.name || 'Unknown',
      vendorId: p.vendor_id,
      url: p.url,
      updatedAt: p.updated_at,
      stockStatus: p.stock_status,
      price1Pack: p.price_1pack,
      region: 'EU',
      daysSinceUpdate: Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Transform US products
    const usProducts = (staleUsProducts || []).map((p: any) => ({
      id: p.id,
      product: p.name,
      vendor: p.us_vendors?.name || 'Unknown',
      vendorId: p.us_vendor_id,
      url: p.url,
      updatedAt: p.updated_at,
      stockStatus: p.stock_status,
      price1Pack: p.price_1pack,
      region: 'US',
      daysSinceUpdate: Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Combine and sort by updatedAt
    const allProducts = [...euProducts, ...usProducts].sort((a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

    // Group by vendor
    const byVendor: Record<string, any[]> = {};
    for (const product of allProducts) {
      const vendor = product.vendor;
      if (!byVendor[vendor]) {
        byVendor[vendor] = [];
      }
      byVendor[vendor].push(product);
    }

    return NextResponse.json({
      success: true,
      cutoffDate: cutoffIso,
      thresholdDays: days,
      totalStale: allProducts.length,
      euCount: euProducts.length,
      usCount: usProducts.length,
      byVendor: Object.fromEntries(
        Object.entries(byVendor).map(([vendor, products]) => [
          vendor,
          {
            count: products.length,
            oldestUpdate: products[0]?.updatedAt,
            products: products.slice(0, 20) // Limit to 20 per vendor
          }
        ])
      ),
      products: allProducts.slice(0, 100) // Return first 100 for quick overview
    });
  } catch (error: any) {
    console.error('Error in stale-products API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
