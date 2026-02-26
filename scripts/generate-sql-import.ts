/**
 * Generate SQL INSERT statements for blog posts migration
 * Run with: npx tsx scripts/generate-sql-import.ts > import.sql
 */

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

// Escape string for SQL
function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

const jsonPath = path.join(process.cwd(), 'all_blog_posts_merged.json');
const posts: BlogPost[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('-- Migration of ' + posts.length + ' blog posts to generated_content');
console.log('-- Generated at: ' + new Date().toISOString());
console.log('');

for (const post of posts) {
  // Generate excerpt from content if not provided
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

  const generationSettings = JSON.stringify({
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
  });

  const sql = `INSERT INTO generated_content (
  workspace_id,
  user_id,
  title,
  content,
  status,
  published,
  published_to_blog,
  blog_post_url,
  featured_image_url,
  created_at,
  updated_at,
  generation_settings,
  article_type,
  language,
  main_keyword
) VALUES (
  '${WORKSPACE_ID}',
  '${USER_ID}',
  '${escapeSql(post.title)}',
  '${escapeSql(post.content)}',
  'published',
  true,
  true,
  'https://nicotine-pouches.org/guides/${escapeSql(post.slug)}',
  '${escapeSql(featuredImageUrl)}',
  '${post.date || new Date().toISOString()}',
  '${post.modified || post.date || new Date().toISOString()}',
  '${escapeSql(generationSettings)}'::jsonb,
  'guide',
  'en',
  '${escapeSql(post.title.split(' ').slice(0, 3).join(' '))}'
) ON CONFLICT DO NOTHING;`;

  console.log(sql);
  console.log('');
}

console.log('-- End of migration');
