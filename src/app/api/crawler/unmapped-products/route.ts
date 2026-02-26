import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// API Key for crawler authentication
const CRAWLER_API_KEY = (process.env.CRAWLER_API_KEY || '').trim();

interface OtherStoreMatch {
  vendor: string;
  vendorId?: number;
  productName: string;
  matchConfidence: number;
  url?: string;
}

interface UnmappedProduct {
  productName: string;
  sourceVendor: string;
  sourceVendorId?: number;
  sourceUrl?: string;
  sourcePrices?: Record<string, string>;
  availableAtOtherStores?: OtherStoreMatch[];
  totalStoresWithProduct?: number;
  imageUrl?: string;
}

interface RequestBody {
  unmappedProducts: UnmappedProduct[];
}

// Authenticate request
function authenticateRequest(request: NextRequest): boolean {
  // Check for API key in headers or query params
  const authHeader = request.headers.get('authorization');
  const apiKeyFromHeader = authHeader?.replace('Bearer ', '').trim();

  const url = new URL(request.url);
  const apiKeyFromQuery = url.searchParams.get('apiKey')?.trim();

  const providedKey = apiKeyFromHeader || apiKeyFromQuery;

  if (!CRAWLER_API_KEY) {
    console.error('CRAWLER_API_KEY not configured on server');
    return false;
  }

  return providedKey === CRAWLER_API_KEY;
}

export async function POST(request: NextRequest) {
  // Authenticate
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing API key' },
      { status: 401 }
    );
  }

  try {
    const body: RequestBody = await request.json();
    const { unmappedProducts } = body;

    if (!unmappedProducts || !Array.isArray(unmappedProducts)) {
      return NextResponse.json(
        { error: 'Invalid request body - unmappedProducts array required' },
        { status: 400 }
      );
    }

    console.log(`Received ${unmappedProducts.length} unmapped products`);

    const results = {
      received: unmappedProducts.length,
      inserted: 0,
      updated: 0,
      errors: [] as string[]
    };

    // Process each unmapped product
    for (const product of unmappedProducts) {
      try {
        // Check if this product already exists in unmapped_products table
        const { data: existing, error: checkError } = await supabaseAdmin()
          .from('unmapped_products')
          .select('id')
          .eq('product_name', product.productName)
          .eq('source_vendor', product.sourceVendor)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = not found, which is fine
          console.error('Error checking existing:', checkError);
        }

        const productData = {
          product_name: product.productName,
          source_vendor: product.sourceVendor,
          source_vendor_id: product.sourceVendorId || null,
          source_url: product.sourceUrl || null,
          source_prices: product.sourcePrices || null,
          other_stores: product.availableAtOtherStores || [],
          total_stores: product.totalStoresWithProduct || 1,
          image_url: product.imageUrl || null,
          status: 'pending', // pending, approved, rejected, mapped
          updated_at: new Date().toISOString()
        };

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabaseAdmin()
            .from('unmapped_products')
            .update(productData)
            .eq('id', existing.id);

          if (updateError) {
            results.errors.push(`Failed to update ${product.productName}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabaseAdmin()
            .from('unmapped_products')
            .insert({
              ...productData,
              created_at: new Date().toISOString()
            });

          if (insertError) {
            results.errors.push(`Failed to insert ${product.productName}: ${insertError.message}`);
          } else {
            results.inserted++;
          }
        }
      } catch (err: any) {
        results.errors.push(`Error processing ${product.productName}: ${err.message}`);
      }
    }

    console.log(`Unmapped products processed: ${results.inserted} inserted, ${results.updated} updated, ${results.errors.length} errors`);

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error: any) {
    console.error('Error processing unmapped products:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve unmapped products for admin
export async function GET(request: NextRequest) {
  // Authenticate
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing API key' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const vendor = url.searchParams.get('vendor');

    let query = supabaseAdmin()
      .from('unmapped_products')
      .select('*', { count: 'exact' })
      .order('total_stores', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (vendor) {
      query = query.eq('source_vendor', vendor);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error: any) {
    console.error('Error fetching unmapped products:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
