import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'UK';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const tableName = region === 'UK' ? 'vendors' : 'us_vendors';

    let query = supabaseAdmin()
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('id', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply status filter (for UK vendors)
    if (status && region === 'UK') {
      query = query.eq('is_active', status === 'active');
    }

    if (status && region === 'US') {
      query = query.eq('status', status);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error in vendors GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region = 'UK', ...vendorData } = body;

    if (!vendorData.name) {
      return NextResponse.json(
        { error: 'Vendor name is required' },
        { status: 400 }
      );
    }

    const tableName = region === 'UK' ? 'vendors' : 'us_vendors';

    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .insert([vendorData])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in vendors POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, region = 'UK', ...vendorData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const tableName = region === 'UK' ? 'vendors' : 'us_vendors';

    const { data, error } = await supabaseAdmin()
      .from(tableName)
      .update(vendorData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      return NextResponse.json(
        { error: 'Failed to update vendor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in vendors PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const region = searchParams.get('region') || 'UK';

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const tableName = region === 'UK' ? 'vendors' : 'us_vendors';

    const { error } = await supabaseAdmin()
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor:', error);
      return NextResponse.json(
        { error: 'Failed to delete vendor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in vendors DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

