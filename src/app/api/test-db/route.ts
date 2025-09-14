import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test if tables exist
    const { data: wishlistTest, error: wishlistError } = await supabase()
      .from('wishlist')
      .select('*')
      .limit(1);

    const { data: priceAlertsTest, error: priceAlertsError } = await supabase()
      .from('price_alerts')
      .select('*')
      .limit(1);

    const { data: productsTest, error: productsError } = await supabase()
      .from('products')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      tables: {
        wishlist: {
          exists: !wishlistError,
          error: wishlistError?.message,
          count: wishlistTest?.length || 0
        },
        price_alerts: {
          exists: !priceAlertsError,
          error: priceAlertsError?.message,
          count: priceAlertsTest?.length || 0
        },
        products: {
          exists: !productsError,
          error: productsError?.message,
          count: productsTest?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
