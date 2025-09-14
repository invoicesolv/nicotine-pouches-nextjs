import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin()
      .from('wp_product_mapping')
      .select('wp_product_id, supabaseAdmin()_product_id')
      .order('wp_product_id');

    if (error) {
      console.error('Error fetching WordPress product mapping:', error);
      return NextResponse.json(
        { error: 'Failed to fetch WordPress product mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in WordPress product mapping API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
