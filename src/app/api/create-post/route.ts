import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// API endpoint to receive blog posts from Axelio CRM content pipeline
// Axelio sends: title, content, category, slug, featured, path, featured_image_url, featured_image_alt, featured_image_attribution, include_images
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      slug,
      category,
      featured,
      path,
      featured_image_url,
      featured_image_alt,
      featured_image_attribution,
      include_images
    } = body;

    console.log('[create-post] Received:', { title, slug, category, featured, path });

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const postSlug = slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 60);

    const supabase = supabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }

    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', postSlug).maybeSingle();
    if (existing) {
      return NextResponse.json({ success: false, error: 'Post with this slug already exists' }, { status: 409 });
    }

    const plainDescription = content.replace(/<[^>]*>/g, '').replace(/[#*_]/g, '').trim().substring(0, 160);
    const slugKeywords = postSlug.replace(/-/g, ' ').trim() + ', nicotine pouches UK';

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: postSlug,
        content,
        excerpt: content.replace(/<[^>]*>/g, '').substring(0, 300) + '...',
        status: 'published',
        author: 'Nicotine Pouches',
        published_at: new Date().toISOString(),
        featured_image: featured_image_url,
        featured_image_alt: featured_image_alt || title,
        meta_description: plainDescription,
        category: category || 'general',
        tags: slugKeywords ? slugKeywords.split(',').map((k: string) => k.trim()) : []
      })
      .select()
      .single();

    if (error) {
      console.error('[create-post] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const postUrl = `https://nicotine-pouches.org/${postSlug}`;
    console.log('[create-post] Created:', postUrl);

    return NextResponse.json({ success: true, postId: newPost.id, postUrl, slug: postSlug });
  } catch (error) {
    console.error('[create-post] Error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
