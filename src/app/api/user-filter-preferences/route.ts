import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase()
      .from('user_filter_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Return default preferences if none exist
    if (!data) {
      return NextResponse.json({
        price_sort: 'low-high',
        pack_size: '1pack',
        shipping_filter: 'fastest',
        review_sort: 'highest'
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching filter preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch filter preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { price_sort, pack_size, shipping_filter, review_sort } = body;

    // Validate input
    const validPriceSorts = ['low-high', 'high-low'];
    const validPackSizes = ['1pack', '3pack', '5pack', '10pack', '15pack', '20pack', '25pack', '30pack', '50pack', '100pack'];
    const validShippingFilters = ['fastest', 'cheapest', 'free', 'all'];
    const validReviewSorts = ['highest', 'lowest'];

    if (price_sort && !validPriceSorts.includes(price_sort)) {
      return NextResponse.json({ error: 'Invalid price_sort value' }, { status: 400 });
    }
    if (pack_size && !validPackSizes.includes(pack_size)) {
      return NextResponse.json({ error: 'Invalid pack_size value' }, { status: 400 });
    }
    if (shipping_filter && !validShippingFilters.includes(shipping_filter)) {
      return NextResponse.json({ error: 'Invalid shipping_filter value' }, { status: 400 });
    }
    if (review_sort && !validReviewSorts.includes(review_sort)) {
      return NextResponse.json({ error: 'Invalid review_sort value' }, { status: 400 });
    }

    // Check if preferences already exist
    const { data: existing } = await supabase()
      .from('user_filter_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const preferencesData = {
      user_id: user.id,
      ...(price_sort && { price_sort }),
      ...(pack_size && { pack_size }),
      ...(shipping_filter && { shipping_filter }),
      ...(review_sort && { review_sort })
    };

    let result;
    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase()
        .from('user_filter_preferences')
        .update(preferencesData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new preferences
      const { data, error } = await supabase()
        .from('user_filter_preferences')
        .insert(preferencesData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error saving filter preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save filter preferences' },
      { status: 500 }
    );
  }
}






