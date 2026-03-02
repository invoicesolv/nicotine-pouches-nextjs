import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createStoreUser } from '@/lib/store-auth';
import { randomBytes } from 'crypto';

function generateTempPassword(): string {
  return randomBytes(6).toString('base64url'); // ~8 char readable password
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin()
      .from('store_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching store applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications.' }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Store applications GET error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, admin_notes } = body;

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // Fetch the application
    const { data: application, error: fetchError } = await supabaseAdmin()
      .from('store_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application has already been reviewed.' }, { status: 400 });
    }

    if (action === 'reject') {
      const { error: updateError } = await supabaseAdmin()
        .from('store_applications')
        .update({
          status: 'rejected',
          admin_notes: admin_notes || null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error rejecting application:', updateError);
        return NextResponse.json({ error: 'Failed to reject application.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: 'rejected' });
    }

    // APPROVE: Create vendor + store user
    const tempPassword = generateTempPassword();

    // 1. Create pouch_vendors entry
    const { data: vendor, error: vendorError } = await supabaseAdmin()
      .from('pouch_vendors')
      .insert({
        name: application.store_name,
        country: application.country,
        website_url: application.website_url || null,
        is_active: false,
      })
      .select()
      .single();

    if (vendorError) {
      console.error('Error creating vendor:', vendorError);
      return NextResponse.json({ error: 'Failed to create vendor entry.' }, { status: 500 });
    }

    // 2. Create store_users entry
    const vendorIdField = application.country === 'us' ? undefined : vendor.id;
    const usVendorIdField = application.country === 'us' ? vendor.id : undefined;

    const storeUser = await createStoreUser(
      application.contact_email,
      tempPassword,
      vendorIdField,
      usVendorIdField
    );

    if (!storeUser) {
      // Rollback: delete the vendor we just created
      await supabaseAdmin().from('pouch_vendors').delete().eq('id', vendor.id);
      return NextResponse.json({ error: 'Failed to create store user.' }, { status: 500 });
    }

    // 3. Update the application
    const { error: updateError } = await supabaseAdmin()
      .from('store_applications')
      .update({
        status: 'approved',
        admin_notes: admin_notes || null,
        reviewed_at: new Date().toISOString(),
        created_vendor_id: vendor.id,
        created_store_user_id: storeUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating application after approval:', updateError);
    }

    return NextResponse.json({
      success: true,
      status: 'approved',
      credentials: {
        email: application.contact_email,
        password: tempPassword,
      },
    });
  } catch (error) {
    console.error('Store applications PATCH error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
