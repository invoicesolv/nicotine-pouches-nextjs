/**
 * Migration script to import all 532 blog posts from JSON to generated_content table
 *
 * Run with: npx tsx scripts/migrate-json-to-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use existing workspace and user from generated_content
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
  featured_image_local?: string;
  seo_meta?: {
    url?: string;
    title?: string;
    description?: string;
    keywords?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical?: string;
    robots?: string;
    author?: string;
    published_time?: string;
    modified_time?: string;
    article_section?: string;
    article_tags?: string[];
  };
}

async function migrate() {
  console.log('🚀 Starting migration of blog posts to generated_content...\n');

  // Load JSON file
  const jsonPath = path.join(process.cwd(), 'all_blog_posts_merged.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ JSON file not found:', jsonPath);
    process.exit(1);
  }

  const posts: BlogPost[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📄 Loaded ${posts.length} posts from JSON file\n`);

  // Get existing slugs to avoid duplicates
  const { data: existingPosts } = await supabase
    .from('generated_content')
    .select('blog_post_url')
    .ilike('blog_post_url', '%/guides/%');

  const existingSlugs = new Set(
    (existingPosts || []).map(p => {
      const match = p.blog_post_url?.match(/\/guides\/([^/]+)\/?$/);
      return match ? match[1] : null;
    }).filter(Boolean)
  );

  console.log(`📊 Found ${existingSlugs.size} existing guides in database\n`);

  // Filter out already imported posts
  const postsToImport = posts.filter(p => !existingSlugs.has(p.slug));
  console.log(`📝 ${postsToImport.length} posts to import (${posts.length - postsToImport.length} already exist)\n`);

  if (postsToImport.length === 0) {
    console.log('✅ All posts already imported!');
    return;
  }

  // Process in batches of 50
  const BATCH_SIZE = 50;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < postsToImport.length; i += BATCH_SIZE) {
    const batch = postsToImport.slice(i, i + BATCH_SIZE);

    const records = batch.map(post => {
      // Generate excerpt from content if not provided
      let excerpt = post.excerpt || '';
      if (!excerpt && post.content) {
        excerpt = post.content
          .replace(/<[^>]*>/g, '')  // Strip HTML
          .replace(/\s+/g, ' ')     // Normalize whitespace
          .trim()
          .substring(0, 300);
      }

      // Build featured image URL - check for local images first
      let featuredImageUrl = post.featured_image_local || null;
      if (!featuredImageUrl && post.wp_id && post.featured_media) {
        // Try to construct path based on wp_id
        const sanitizedTitle = post.title
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 50);
        featuredImageUrl = `/blog-images/post_${post.wp_id}_${sanitizedTitle}.jpg`;
      }

      return {
        workspace_id: WORKSPACE_ID,
        user_id: USER_ID,
        title: post.title,
        content: post.content,  // Full HTML content preserved
        status: 'published',
        published: true,
        published_to_blog: true,
        blog_post_url: `https://nicotine-pouches.org/guides/${post.slug}`,
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
          seo_meta: post.seo_meta || {
            title: post.title,
            description: excerpt
          }
        },
        article_type: 'guide',
        language: 'en',
        main_keyword: post.title.split(' ').slice(0, 3).join(' ')
      };
    });

    // Insert batch
    const { data, error } = await supabase
      .from('generated_content')
      .insert(records)
      .select('id, title');

    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      failed += batch.length;

      // Try inserting one by one to identify problematic records
      for (const record of records) {
        const { error: singleError } = await supabase
          .from('generated_content')
          .insert(record);

        if (singleError) {
          console.error(`  ❌ Failed: "${record.title.substring(0, 50)}..." - ${singleError.message}`);
        } else {
          imported++;
          console.log(`  ✅ Imported: "${record.title.substring(0, 50)}..."`);
        }
      }
    } else {
      imported += batch.length;
      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Imported ${batch.length} posts (${imported}/${postsToImport.length})`);
    }
  }

  console.log('\n========================================');
  console.log(`🎉 Migration complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total in DB: ${existingSlugs.size + imported}`);
  console.log('========================================\n');
}

// Run migration
migrate().catch(console.error);
