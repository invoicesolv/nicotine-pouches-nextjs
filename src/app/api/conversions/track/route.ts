import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor_id, order_value, order_id, currency } = body;

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'vendor_id is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const vendorIdInt = parseInt(vendor_id, 10);
    if (isNaN(vendorIdInt)) {
      return NextResponse.json(
        { error: 'vendor_id must be a number' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabaseAdmin()
      .from('vendors')
      .select('id, name')
      .eq('id', vendorIdInt)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Invalid vendor_id' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Deduplicate by order_id if provided
    if (order_id) {
      const { data: existing } = await supabaseAdmin()
        .from('vendor_analytics')
        .select('id')
        .eq('vendor_id', vendorIdInt)
        .eq('event_type', 'vendor_conversion')
        .eq('event_data->>order_id', String(order_id))
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: true, deduplicated: true },
          { headers: CORS_HEADERS }
        );
      }
    }

    // Log the conversion
    const { error: insertError } = await supabaseAdmin()
      .from('vendor_analytics')
      .insert({
        vendor_id: vendorIdInt,
        event_type: 'vendor_conversion',
        event_data: {
          vendor_name: vendor.name,
          order_value: order_value || null,
          order_id: order_id || null,
          currency: currency || 'GBP',
          source: 'utm_tracking_pixel',
        },
        timestamp: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Conversion insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to log conversion' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
