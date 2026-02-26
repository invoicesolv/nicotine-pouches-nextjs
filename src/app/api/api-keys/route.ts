import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getActiveWorkspaceId } from '@/lib/workspace-utils';

// Simple encryption/decryption (in production, use a proper encryption library)
function encryptKey(key: string): string {
  // For now, just base64 encode. In production, use proper encryption
  return Buffer.from(key).toString('base64');
}

function decryptKey(encryptedKey: string): string {
  return Buffer.from(encryptedKey, 'base64').toString('utf-8');
}

// Hash key for comparison (never store plain keys)
function hashKey(key: string): string {
  // Simple hash for comparison - in production use crypto.createHash
  return Buffer.from(key).toString('base64');
}

/**
 * GET /api/api-keys
 * List API keys (without exposing actual key values)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing X-User-ID header' },
        { status: 401 }
      );
    }

    const workspaceId = await getActiveWorkspaceId(userId);
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const { data: keys, error } = await supabase()
      .from('api_keys')
      .select('id, name, key_type, description, is_active, created_at, updated_at, last_used_at, usage_count')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: keys || []
    });
  } catch (error: any) {
    console.error('Error in GET /api/api-keys:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing X-User-ID header' },
        { status: 401 }
      );
    }

    const workspaceId = await getActiveWorkspaceId(userId);
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, key_type = 'crm', key_value, description } = body;

    if (!name || !key_value) {
      return NextResponse.json(
        { error: 'Missing required fields: name and key_value' },
        { status: 400 }
      );
    }

    if (!['crm', 'crawler', 'custom'].includes(key_type)) {
      return NextResponse.json(
        { error: 'Invalid key_type. Must be: crm, crawler, or custom' },
        { status: 400 }
      );
    }

    // Check if name already exists in workspace
    const { data: existing } = await supabase()
      .from('api_keys')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'API key with this name already exists in your workspace' },
        { status: 409 }
      );
    }

    // Encrypt and store the key
    const encryptedKey = encryptKey(key_value);

    const { data: newKey, error: insertError } = await supabase()
      .from('api_keys')
      .insert({
        name: name.trim(),
        key_type,
        key_value: encryptedKey,
        description: description || null,
        workspace_id: workspaceId,
        created_by: userId,
        is_active: true
      })
      .select('id, name, key_type, description, is_active, created_at')
      .single();

    if (insertError) {
      console.error('Error creating API key:', insertError);
      return NextResponse.json(
        { error: 'Failed to create API key', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key created successfully',
      data: newKey
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/api-keys:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


