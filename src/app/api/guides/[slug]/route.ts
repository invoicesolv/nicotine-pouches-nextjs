import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// API Key for CRM authentication
const CRM_API_KEY = (process.env.CRM_API_KEY || process.env.CRAWLER_API_KEY || '').trim();

// Simple encryption/decryption helpers (match api-keys route)
function encryptKey(key: string): string {
  return Buffer.from(key).toString('base64');
}

function decryptKey(encryptedKey: string): string {
  return Buffer.from(encryptedKey, 'base64').toString('utf-8');
}

// Authenticate the request - checks both environment variables and database
async function authenticateRequest(request: NextRequest): Promise<{ valid: boolean; keyId?: string }> {
  // Get the API key from request
  let providedKey: string | null = null;

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    providedKey = authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  // Check query parameter if no header
  if (!providedKey) {
    const apiKey = request.nextUrl.searchParams.get('apiKey');
    if (apiKey) {
      providedKey = apiKey.trim();
    }
  }

  if (!providedKey || providedKey.length === 0) {
    return { valid: false };
  }

  // First, check environment variables (for backward compatibility)
  if (CRM_API_KEY && CRM_API_KEY.length > 0) {
    if (providedKey === CRM_API_KEY) {
      return { valid: true };
    }
  }

  // Then, check database for CRM API keys
  try {
    const { data: apiKeys, error } = await supabase()
      .from('api_keys')
      .select('id, key_value, key_type, usage_count')
      .eq('key_type', 'crm')
      .eq('is_active', true);

    if (!error && apiKeys && apiKeys.length > 0) {
      for (const keyRecord of apiKeys) {
        try {
          const decryptedKey = decryptKey(keyRecord.key_value);
          if (providedKey === decryptedKey) {
            // Update usage stats
            await supabase()
              .from('api_keys')
              .update({
                last_used_at: new Date().toISOString(),
                usage_count: (keyRecord.usage_count || 0) + 1
              })
              .eq('id', keyRecord.id);

            return { valid: true, keyId: keyRecord.id };
          }
        } catch (decryptError) {
          console.error('Error decrypting API key:', decryptError);
          continue;
        }
      }
    }
  } catch (dbError) {
    console.error('Error checking database for API keys:', dbError);
    // Fall through to return invalid if DB check fails
  }

  return { valid: false };
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET endpoint - retrieve a specific guide by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Fetch from generated_content (single source of truth)
    const { data: post, error } = await supabase()
      .from('generated_content')
      .select('*')
      .eq('published_to_blog', true)
      .in('status', ['publish', 'published'])
      .ilike('blog_post_url', `%/guides/${slug}`)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('Error in GET /api/guides/[slug]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT endpoint - update an existing guide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. Invalid API key.',
          message: 'Please provide a valid API key in the Authorization header (Bearer token) or apiKey query parameter.'
        },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const body = await request.json();
    const {
      title,
      slug: newSlug,
      excerpt,
      content,
      date,
      modified,
      author,
      featured_media,
      featured_image,
      featured_image_local,
      link,
      categories,
      tags,
      status,
      type,
      format,
      sticky,
      seo_meta
    } = body;

    // Check if post exists
    const { data: existingPost, error: fetchError } = await supabaseAdmin()
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Guide not found', slug },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Update fields if provided
    if (title !== undefined) {
      updateData.title = title.trim();
      // If slug is not explicitly provided but title changed, regenerate slug
      if (!newSlug && title) {
        updateData.slug = generateSlug(title);
      }
    }
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (author !== undefined) updateData.author = author;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (format !== undefined) updateData.format = format;
    if (sticky !== undefined) updateData.sticky = sticky;
    if (date !== undefined) updateData.date = new Date(date).toISOString();
    if (modified !== undefined) updateData.modified = new Date(modified).toISOString();
    if (featured_media !== undefined) updateData.featured_media = featured_media;
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (featured_image_local !== undefined) updateData.featured_image_local = featured_image_local;
    if (link !== undefined) updateData.link = link;
    if (categories !== undefined && Array.isArray(categories)) updateData.categories = categories;
    if (tags !== undefined && Array.isArray(tags)) updateData.tags = tags;
    if (seo_meta !== undefined && typeof seo_meta === 'object') updateData.seo_meta = seo_meta;

    // Check if new slug conflicts with existing post
    if (updateData.slug && updateData.slug !== slug) {
      const { data: conflictPost } = await supabaseAdmin()
        .from('blog_posts')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', existingPost.id)
        .single();

      if (conflictPost) {
        return NextResponse.json(
          { 
            error: 'Slug already exists',
            slug: updateData.slug,
            message: 'Another post already uses this slug.'
          },
          { status: 409 }
        );
      }
    }

    // Update the post using admin client to bypass RLS
    const { data: updatedPost, error: updateError } = await supabaseAdmin()
      .from('blog_posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating blog post:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to update blog post',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guide updated successfully',
      data: updatedPost
    });

  } catch (error: any) {
    console.error('Error in PUT /api/guides/[slug]:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint - delete a guide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. Invalid API key.',
          message: 'Please provide a valid API key in the Authorization header (Bearer token) or apiKey query parameter.'
        },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Check if post exists
    const { data: existingPost } = await supabaseAdmin()
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Guide not found', slug },
        { status: 404 }
      );
    }

    // Delete the post using admin client to bypass RLS
    const { error: deleteError } = await supabaseAdmin()
      .from('blog_posts')
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      console.error('Error deleting blog post:', deleteError);
      return NextResponse.json(
        { 
          error: 'Failed to delete blog post',
          details: deleteError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guide deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/guides/[slug]:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

