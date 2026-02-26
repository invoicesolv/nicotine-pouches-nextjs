import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ID = '37f99e9d-a2b6-4900-8cfb-fe1e58afa592';
const USER_ID = '8e741f9b-0398-4920-96fe-9f78b7485b2f';

interface BlogPost {
  wp_id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  slug: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  status: string;
  type: string;
  format: string;
  sticky: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check for secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'migrate-532-posts') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin();

    // Load JSON file
    const jsonPath = path.join(process.cwd(), 'all_blog_posts_merged.json');

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'JSON file not found' }, { status: 404 });
    }

    const posts: BlogPost[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded ${posts.length} posts from JSON`);

    // Get existing slugs
    const { data: existingPosts } = await supabase
      .from('generated_content')
      .select('blog_post_url');

    const existingSlugs = new Set(
      (existingPosts || []).map(p => {
        const match = p.blog_post_url?.match(/\/guides\/([^/]+)\/?$/);
        return match ? match[1] : null;
      }).filter(Boolean)
    );

    // Filter posts to import
    const postsToImport = posts.filter(p => !existingSlugs.has(p.slug));
    console.log(`${postsToImport.length} posts to import`);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    // Import one by one to handle large content
    for (const post of postsToImport) {
      try {
        // Generate excerpt
        let excerpt = post.excerpt || '';
        if (!excerpt && post.content) {
          excerpt = post.content
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 300);
        }

        // Build featured image URL
        let featuredImageUrl = '';
        if (post.wp_id && post.featured_media) {
          const sanitizedTitle = post.title
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
          featuredImageUrl = `/blog-images/post_${post.wp_id}_${sanitizedTitle}.jpg`;
        }

        const record = {
          workspace_id: WORKSPACE_ID,
          user_id: USER_ID,
          title: post.title,
          content: post.content, // Full HTML content
          status: 'published',
          published: true,
          published_to_blog: true,
          blog_post_url: `https://nicotine-pouches.org/${post.slug}`,
          featured_image_url: featuredImageUrl,
          created_at: post.date || new Date().toISOString(),
          updated_at: post.modified || post.date || new Date().toISOString(),
          generation_settings: {
            source: 'wordpress_import',
            wp_id: post.wp_id,
            original_slug: post.slug,
            categories: post.categories,
            tags: post.tags,
            format: post.format,
            sticky: post.sticky,
            excerpt: excerpt,
            seo_meta: {
              title: post.title,
              description: excerpt
            }
          },
          article_type: 'guide',
          language: 'en',
          main_keyword: post.title.split(' ').slice(0, 3).join(' ')
        };

        // Direct INSERT
        const { error } = await supabase
          .from('generated_content')
          .insert(record);

        if (error) {
          console.error(`Failed to import "${post.title}":`, error.message);
          errors.push(`${post.slug}: ${error.message}`);
          failed++;
        } else {
          imported++;
          if (imported % 50 === 0) {
            console.log(`Imported ${imported}/${postsToImport.length}`);
          }
        }
      } catch (err: any) {
        console.error(`Exception importing "${post.title}":`, err.message);
        errors.push(`${post.slug}: ${err.message}`);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration complete',
      stats: {
        total_in_json: posts.length,
        already_existed: existingSlugs.size,
        imported: imported,
        failed: failed,
        total_in_db: existingSlugs.size + imported
      },
      errors: errors.slice(0, 20) // First 20 errors
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: error.message
    }, { status: 500 });
  }
}

// GET to check status
export async function GET(request: NextRequest) {
  const supabase = supabaseAdmin();

  const { count } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    message: 'Migration endpoint ready',
    current_posts_in_db: count,
    usage: 'POST /api/migrate-posts?secret=migrate-532-posts'
  });
}
