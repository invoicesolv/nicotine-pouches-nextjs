import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getActiveWorkspaceId } from '@/lib/workspace-utils';

function encryptKey(key: string): string {
  return Buffer.from(key).toString('base64');
}

function decryptKey(encryptedKey: string): string {
  return Buffer.from(encryptedKey, 'base64').toString('utf-8');
}

/**
 * GET /api/api-keys/[id]
 * Get a specific API key (without exposing the actual key value)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing X-User-ID header' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const keyId = resolvedParams.id;

    const workspaceId = await getActiveWorkspaceId(userId);
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const { data: key, error } = await supabase()
      .from('api_keys')
      .select('id, name, key_type, description, is_active, created_at, updated_at, last_used_at, usage_count')
      .eq('id', keyId)
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !key) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: key
    });
  } catch (error: any) {
    console.error('Error in GET /api/api-keys/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/api-keys/[id]
 * Update an API key
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing X-User-ID header' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const keyId = resolvedParams.id;

    const workspaceId = await getActiveWorkspaceId(userId);
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, key_value, description, is_active } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (key_value !== undefined) {
      updateData.key_value = encryptKey(key_value);
    }

    const { data: updatedKey, error: updateError } = await supabase()
      .from('api_keys')
      .update(updateData)
      .eq('id', keyId)
      .eq('workspace_id', workspaceId)
      .select('id, name, key_type, description, is_active, updated_at')
      .single();

    if (updateError || !updatedKey) {
      return NextResponse.json(
        { error: 'Failed to update API key', details: updateError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
      data: updatedKey
    });
  } catch (error: any) {
    console.error('Error in PUT /api/api-keys/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/api-keys/[id]
 * Delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing X-User-ID header' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const keyId = resolvedParams.id;

    const workspaceId = await getActiveWorkspaceId(userId);
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase()
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('workspace_id', workspaceId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete API key', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/api-keys/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


