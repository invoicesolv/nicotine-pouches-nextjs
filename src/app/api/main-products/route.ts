import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const flavour = searchParams.get('flavour');
    const strength = searchParams.get('strength');
    const format = searchParams.get('format');

    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase()
      .from('wp_products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,flavour.ilike.%${search}%`);
    }
    if (brand) {
      query = query.eq('brand', brand);
    }
    if (flavour) {
      query = query.ilike('flavour', `%${flavour}%`);
    }
    if (strength) {
      query = query.eq('strength_group', strength);
    }
    if (format) {
      query = query.eq('format', format);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) throw productsError;

    // Get total count for pagination
    let countQuery = supabase()
      .from('wp_products')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,brand.ilike.%${search}%,flavour.ilike.%${search}%`);
    }
    if (brand) {
      countQuery = countQuery.eq('brand', brand);
    }
    if (flavour) {
      countQuery = countQuery.ilike('flavour', `%${flavour}%`);
    }
    if (strength) {
      countQuery = countQuery.eq('strength_group', strength);
    }
    if (format) {
      countQuery = countQuery.eq('format', format);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    return NextResponse.json({
      products: products || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error fetching main products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch main products' },
      { status: 500 }
    );
  }
}
