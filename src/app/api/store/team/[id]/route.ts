import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

// Role hierarchy: higher number = more privilege
const ROLE_LEVELS: Record<string, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  store_owner: 4,
  super_admin: 5,
};

const MANAGE_ALLOWED_ROLES = ['store_owner', 'super_admin'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { user } = authResult;

    // Only store_owner or super_admin can update team members
    if (!MANAGE_ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update team members' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Can't change your own role
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { role, is_active } = body;

    // Validate that the target user belongs to the same vendor
    const { data: targetUser, error: targetError } = await supabaseAdmin()
      .from('store_users')
      .select('id, vendor_id, us_vendor_id, role')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Check vendor match
    const sameVendor =
      (user.vendor_id && targetUser.vendor_id === user.vendor_id) ||
      (user.us_vendor_id && targetUser.us_vendor_id === user.us_vendor_id);

    if (!sameVendor && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Team member does not belong to your vendor' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    // If changing role, validate hierarchy
    if (role !== undefined) {
      if (!ROLE_LEVELS[role]) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400, headers: AUTH_CACHE_HEADERS }
        );
      }

      // Can't promote someone above your own role (unless super_admin)
      if (user.role !== 'super_admin' && ROLE_LEVELS[role] >= ROLE_LEVELS[user.role]) {
        return NextResponse.json(
          { error: 'Cannot promote a member to a role equal to or higher than your own' },
          { status: 403, headers: AUTH_CACHE_HEADERS }
        );
      }
    }

    // Build update object
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updated, error: updateError } = await supabaseAdmin()
      .from('store_users')
      .update(updateData)
      .eq('id', targetUserId)
      .select('id, email, role, is_active, last_login, created_at')
      .single();

    if (updateError) {
      console.error('Error updating team member:', updateError);
      return NextResponse.json(
        { error: 'Failed to update team member' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { member: updated },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in team member update API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { user } = authResult;

    // Only store_owner or super_admin can remove team members
    if (!MANAGE_ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove team members' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Can't remove yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Validate that the target user belongs to the same vendor
    const { data: targetUser, error: targetError } = await supabaseAdmin()
      .from('store_users')
      .select('id, vendor_id, us_vendor_id')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Check vendor match
    const sameVendor =
      (user.vendor_id && targetUser.vendor_id === user.vendor_id) ||
      (user.us_vendor_id && targetUser.us_vendor_id === user.us_vendor_id);

    if (!sameVendor && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Team member does not belong to your vendor' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Deactivate the user
    const { error: deactivateError } = await supabaseAdmin()
      .from('store_users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    if (deactivateError) {
      console.error('Error deactivating team member:', deactivateError);
      return NextResponse.json(
        { error: 'Failed to remove team member' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Delete their sessions
    const { error: sessionsError } = await supabaseAdmin()
      .from('store_sessions')
      .delete()
      .eq('store_user_id', targetUserId);

    if (sessionsError) {
      console.error('Error deleting sessions for removed member:', sessionsError);
      // Non-fatal — user is already deactivated
    }

    return NextResponse.json(
      { success: true },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in team member delete API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
