import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.CRAWLER_API_KEY || '';

function authenticateAdmin(request: NextRequest): boolean {
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!ADMIN_API_KEY || !apiKey) return false;
  return apiKey === ADMIN_API_KEY;
}

export async function GET(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const source = searchParams.get('source') || '';
    const status = searchParams.get('status') || '';

    let query = supabaseAdmin()
      .from('signups')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply source filter
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching signups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch signups' },
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
    console.error('Error in signups GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Signup ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin()
      .from('signups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting signup:', error);
      return NextResponse.json(
        { error: 'Failed to delete signup' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in signup DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, is_active } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Signup ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from('signups')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating signup:', error);
      return NextResponse.json(
        { error: 'Failed to update signup' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in signup PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

