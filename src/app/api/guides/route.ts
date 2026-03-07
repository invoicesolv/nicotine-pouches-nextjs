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
      .select('id, key_value, key_type')
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
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// GET endpoint - retrieve guides from generated_content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: posts, error } = await supabase()
      .from('generated_content')
      .select('*')
      .eq('published_to_blog', true)
      .in('status', ['publish', 'published'])
      .ilike('blog_post_url', '%/guides/%')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching guides:', error);
      return NextResponse.json(
        { error: 'Failed to fetch guides', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: posts || [],
      count: posts?.length || 0
    });
  } catch (error: any) {
    console.error('Error in GET /api/guides:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint - create new guide
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      wp_id,
      title,
      slug,
      excerpt,
      content,
      date,
      modified,
      author,
      featured_media,
      featured_image,
      featured_image_url, // New: featured_image_url from CRM
      featured_image_alt, // New: alt text for featured image
      featured_image_local,
      link,
      categories,
      category, // New: single category string
      tags,
      status = 'published',
      type = 'post',
      format = 'standard',
      sticky = false,
      seo_meta
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }

    if (!excerpt) {
      return NextResponse.json(
        { error: 'Missing required field: excerpt' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(title);

    // Base URL for generating links
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nicotine-pouches.org';

    // Prepare data for insertion - map to existing database schema
    const now = new Date().toISOString();

    // Normalize status: accept 'publish' for backwards compatibility, convert to 'published'
    const normalizedStatus = status === 'publish' ? 'published' : (status || 'draft');

    // Extract meta_description from multiple sources (priority order)
    const finalMetaDescription =
      (seo_meta && typeof seo_meta === 'object' && seo_meta.description) ||
      body.meta_description ||
      excerpt.substring(0, 160);

    const postData: any = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author || 'Nicotine Pouches',
      status: normalizedStatus,
      meta_description: finalMetaDescription,
      published_at: date ? new Date(date).toISOString() : now,
      updated_at: now
    };

    // Handle featured image - prioritize featured_image_url, fallback to featured_image
    if (featured_image_url) {
      postData.featured_image = featured_image_url;
    } else if (featured_image) {
      postData.featured_image = featured_image;
    }

    // Handle featured_image_alt
    if (featured_image_alt) {
      postData.featured_image_alt = featured_image_alt;
    }

    // Handle category - DB uses single text field, not array
    if (category) {
      postData.category = category;
    } else if (categories && Array.isArray(categories) && categories.length > 0) {
      // If categories array provided, use first one
      postData.category = String(categories[0]);
    }

    // Handle tags array
    if (tags && Array.isArray(tags)) {
      postData.tags = tags;
    }

    // Check if post with same slug already exists
    const { data: existingPost } = await supabaseAdmin()
      .from('blog_posts')
      .select('id, slug')
      .eq('slug', finalSlug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { 
          error: 'Post with this slug already exists',
          existing_post_id: existingPost.id,
          slug: finalSlug,
          message: 'Use PUT /api/guides/[slug] to update an existing post, or provide a different slug.'
        },
        { status: 409 }
      );
    }

    // Insert the post using admin client to bypass RLS
    const { data: newPost, error: insertError } = await supabaseAdmin()
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting blog post:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to create blog post',
          details: insertError.message 
        },
        { status: 500 }
      );
    }

    // Generate the post URL
    const postUrl = newPost.link || `${baseUrl}/${newPost.slug}`;

    return NextResponse.json({
      success: true,
      message: 'Guide created successfully',
      data: {
        ...newPost,
        url: postUrl // Include URL in response
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/guides:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

