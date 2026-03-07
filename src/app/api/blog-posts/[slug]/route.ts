import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getFullUrl } from '@/config/seo-config';

// Single source of truth: blog_posts table only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: post, error } = await supabase()
      .from('blog_posts')
      .select('id, wp_id, title, slug, excerpt, content, date, created_at, featured_image, featured_image_local, seo_meta')
      .eq('slug', slug)
      .in('status', ['publish', 'published'])
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const excerpt = post.excerpt || post.content?.substring(0, 200).replace(/<[^>]*>/g, '').replace(/[#*_]/g, '') || '';

    return NextResponse.json({
      id: post.id,
      wp_id: post.wp_id,
      title: post.title,
      slug: post.slug,
      excerpt: excerpt,
      content: post.content,
      date: post.date || post.created_at,
      author: 'Nicotine Pouches',
      featured_image: post.featured_image,
      featured_image_local: post.featured_image_local || post.featured_image,
      status: 'published',
      type: 'post',
      source: 'blog_posts',
      link: getFullUrl(`/${post.slug}`),
      seo_meta: post.seo_meta || { title: post.title, description: excerpt }
    });
  } catch (error) {
    console.error('Error in blog post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
