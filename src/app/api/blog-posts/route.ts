import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getFullUrl } from '@/config/seo-config';

// Single source of truth: blog_posts table only (Axelio + migrated posts)
// List endpoint: do NOT select content or seo_meta to avoid statement timeout (552+ rows)
// Ensure index exists: sql-migrations/blog_posts_list_index.sql
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '100', 10)), 500);

    const { data: posts, error } = await supabase()
      .from('blog_posts')
      .select('id, wp_id, title, slug, excerpt, date, created_at, featured_image, featured_image_local')
      .in('status', ['publish', 'published'])
      .order('date', { ascending: false })
      .range(0, limit - 1);

    if (error) {
      console.error('[Blog Posts API] Error fetching from blog_posts:', error);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }

    const processedPosts = (posts || []).map((post: { id?: number; wp_id?: number; title?: string; slug?: string; excerpt?: string; date?: string; created_at?: string; featured_image?: string; featured_image_local?: string }) => {
      const excerpt = post.excerpt?.replace(/<[^>]*>/g, '').replace(/[#*_]/g, '').trim().slice(0, 300) || '';
      return {
        id: post.id,
        wp_id: post.wp_id,
        title: post.title,
        slug: post.slug,
        excerpt,
        date: post.date || post.created_at,
        author: 'Nicotine Pouches Team',
        featured_image: post.featured_image,
        featured_image_local: post.featured_image_local || post.featured_image,
        status: 'published',
        type: 'post',
        source: 'blog_posts',
        link: getFullUrl(`/${post.slug}`),
        seo_meta: { title: post.title, description: excerpt }
      };
    });

    console.log(`[Blog Posts API] Returning ${processedPosts.length} posts from blog_posts`);
    return NextResponse.json(processedPosts);
  } catch (error) {
    console.error('Error in blog posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
