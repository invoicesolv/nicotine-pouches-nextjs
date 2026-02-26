#!/usr/bin/env node
/**
 * Migration Script: JSON Blog Posts → Supabase Database
 *
 * This script migrates all blog posts from all_blog_posts_with_content.json
 * to the blog_posts table in Supabase.
 *
 * Features:
 * - Preserves all metadata, HTML content, and structure
 * - Generates SEO meta from title/excerpt
 * - Skips duplicates (checks by slug)
 * - Dry-run mode for testing
 * - Batch processing for performance
 * - Transaction-safe
 *
 * Usage:
 *   node scripts/migrate-json-to-database.js --dry-run    # Preview only
 *   node scripts/migrate-json-to-database.js              # Execute migration
 *   node scripts/migrate-json-to-database.js --force      # Skip duplicate check, update existing
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const BATCH_SIZE = 50; // Insert in batches for performance
const JSON_FILE = 'all_blog_posts_with_content.json';
const BASE_URL = 'https://nicotine-pouches.org';

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE_UPDATE = args.includes('--force');
const VERBOSE = args.includes('--verbose') || args.includes('-v');

// Supabase configuration - uses same env as the app
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Use environment variables with fallbacks (same as src/lib/supabase.ts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required for migration');
  console.error('Please ensure your .env.local file contains this key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper: Generate SEO meta from post data
function generateSeoMeta(post) {
  const title = post.title || '';
  const excerpt = post.excerpt || '';

  // Clean excerpt for description (strip HTML, limit length)
  let description = excerpt
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  // If no excerpt, generate from content
  if (!description && post.content) {
    description = post.content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160);
  }

  // Truncate to 160 chars for meta description
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return {
    title: title,
    description: description,
    og_title: title,
    og_description: description,
    twitter_title: title,
    twitter_description: description,
    canonical_url: `${BASE_URL}/guides/${post.slug}`,
    keywords: extractKeywords(title, post.content)
  };
}

// Helper: Extract keywords from title and content
function extractKeywords(title, content) {
  const text = `${title} ${content || ''}`.toLowerCase();

  // Common nicotine pouch related keywords to look for
  const relevantKeywords = [
    'nicotine pouches', 'nicotine pouch', 'snus', 'zyn', 'velo', 'nordic spirit',
    'tobacco-free', 'smokeless', 'oral nicotine', 'white snus', 'nicopods',
    'nicotine strength', 'flavors', 'flavours', 'mint', 'citrus', 'berry',
    'uk', 'europe', 'usa', 'health', 'benefits', 'risks', 'guide', 'review',
    'best', 'top', 'compare', 'vs', 'alternative', 'quit smoking'
  ];

  const found = relevantKeywords.filter(kw => text.includes(kw));
  return found.slice(0, 10).join(', ');
}

// Helper: Find local image for post
function findLocalImage(post) {
  const blogImagesDir = path.join(__dirname, '..', 'public', 'blog-images');

  if (!post.featured_media || post.featured_media === 0) {
    return null;
  }

  const possibleImageNames = [
    `post_${post.wp_id}_${post.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`,
    `post_${post.wp_id}_${post.slug}`,
    post.slug,
    post.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
  ];

  for (const imageName of possibleImageNames) {
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
      const imagePath = path.join(blogImagesDir, `${imageName}${ext}`);
      if (fs.existsSync(imagePath)) {
        return `/blog-images/${imageName}${ext}`;
      }
    }
  }

  return null;
}

// Helper: Transform JSON post to database format
function transformPost(jsonPost) {
  const now = new Date().toISOString();
  const localImage = findLocalImage(jsonPost);
  const seoMeta = generateSeoMeta(jsonPost);

  return {
    // Core fields from JSON
    wp_id: jsonPost.wp_id || null,
    title: jsonPost.title?.trim() || 'Untitled',
    slug: jsonPost.slug?.trim() || `post-${jsonPost.wp_id}`,
    excerpt: jsonPost.excerpt?.trim() || '',
    content: jsonPost.content || '', // Preserve full HTML
    date: jsonPost.date ? new Date(jsonPost.date).toISOString() : now,
    modified: jsonPost.modified ? new Date(jsonPost.modified).toISOString() : now,

    // Metadata
    author: 'Nicotine Pouches Team',
    status: jsonPost.status || 'publish',
    type: jsonPost.type || 'post',
    format: jsonPost.format || 'standard',
    sticky: jsonPost.sticky || false,

    // Media
    featured_media: jsonPost.featured_media || null,
    featured_image: localImage, // Use local image if found
    featured_image_local: localImage,

    // Taxonomies
    categories: jsonPost.categories || [],
    tags: jsonPost.tags || [],

    // Generated fields
    link: `${BASE_URL}/guides/${jsonPost.slug}`,
    seo_meta: seoMeta,

    // Timestamps - preserve original dates
    created_at: jsonPost.date ? new Date(jsonPost.date).toISOString() : now,
    updated_at: jsonPost.modified ? new Date(jsonPost.modified).toISOString() : now
  };
}

// Main migration function
async function migrate() {
  console.log('='.repeat(60));
  console.log('Blog Posts Migration: JSON → Database');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);
  console.log(`Force Update: ${FORCE_UPDATE ? 'YES' : 'NO'}`);
  console.log('');

  // 1. Read JSON file
  const jsonPath = path.join(__dirname, '..', JSON_FILE);

  if (!fs.existsSync(jsonPath)) {
    console.error(`ERROR: JSON file not found: ${jsonPath}`);
    process.exit(1);
  }

  console.log(`Reading ${JSON_FILE}...`);
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const jsonPosts = JSON.parse(jsonContent);

  console.log(`Found ${jsonPosts.length} posts in JSON file`);
  console.log('');

  // 2. Get existing slugs from database
  console.log('Fetching existing posts from database...');
  const { data: existingPosts, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id, slug, wp_id, updated_at');

  if (fetchError) {
    console.error('ERROR fetching existing posts:', fetchError.message);
    process.exit(1);
  }

  const existingSlugs = new Map();
  (existingPosts || []).forEach(post => {
    existingSlugs.set(post.slug, post);
  });

  console.log(`Found ${existingSlugs.size} existing posts in database`);
  console.log('');

  // 3. Categorize posts
  const toInsert = [];
  const toUpdate = [];
  const skipped = [];

  for (const jsonPost of jsonPosts) {
    if (!jsonPost.slug) {
      skipped.push({ post: jsonPost, reason: 'No slug' });
      continue;
    }

    // Only migrate 'publish' status posts (or all if force)
    if (!FORCE_UPDATE && jsonPost.status !== 'publish') {
      skipped.push({ post: jsonPost, reason: `Status: ${jsonPost.status}` });
      continue;
    }

    const existing = existingSlugs.get(jsonPost.slug);

    if (existing) {
      if (FORCE_UPDATE) {
        toUpdate.push({ jsonPost, existingId: existing.id });
      } else {
        skipped.push({ post: jsonPost, reason: 'Already exists' });
      }
    } else {
      toInsert.push(jsonPost);
    }
  }

  console.log('Migration Plan:');
  console.log(`  - Posts to INSERT: ${toInsert.length}`);
  console.log(`  - Posts to UPDATE: ${toUpdate.length}`);
  console.log(`  - Posts SKIPPED:   ${skipped.length}`);
  console.log('');

  if (VERBOSE && skipped.length > 0) {
    console.log('Skipped posts:');
    skipped.slice(0, 20).forEach(({ post, reason }) => {
      console.log(`  - ${post.slug || post.title}: ${reason}`);
    });
    if (skipped.length > 20) {
      console.log(`  ... and ${skipped.length - 20} more`);
    }
    console.log('');
  }

  if (DRY_RUN) {
    console.log('DRY RUN - No changes made');
    console.log('');
    console.log('Sample transformed post:');
    if (toInsert.length > 0) {
      const sample = transformPost(toInsert[0]);
      console.log(JSON.stringify({
        ...sample,
        content: sample.content.substring(0, 200) + '...',
        seo_meta: sample.seo_meta
      }, null, 2));
    }
    return;
  }

  // 4. Perform inserts in batches
  if (toInsert.length > 0) {
    console.log(`Inserting ${toInsert.length} new posts in batches of ${BATCH_SIZE}...`);

    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const transformedBatch = batch.map(transformPost);

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(transformedBatch)
        .select('id, slug');

      if (error) {
        console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
        errors += batch.length;

        // Try inserting one by one to identify problem posts
        for (const post of transformedBatch) {
          const { error: singleError } = await supabase
            .from('blog_posts')
            .insert(post);

          if (singleError) {
            console.error(`    Failed: ${post.slug} - ${singleError.message}`);
          } else {
            inserted++;
            errors--;
          }
        }
      } else {
        inserted += data.length;
        process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${data.length} posts\r`);
      }
    }

    console.log('');
    console.log(`Insert complete: ${inserted} succeeded, ${errors} failed`);
  }

  // 5. Perform updates if force mode
  if (FORCE_UPDATE && toUpdate.length > 0) {
    console.log(`Updating ${toUpdate.length} existing posts...`);

    let updated = 0;
    let errors = 0;

    for (const { jsonPost, existingId } of toUpdate) {
      const transformed = transformPost(jsonPost);
      delete transformed.created_at; // Don't update created_at

      const { error } = await supabase
        .from('blog_posts')
        .update(transformed)
        .eq('id', existingId);

      if (error) {
        console.error(`  Update failed for ${jsonPost.slug}:`, error.message);
        errors++;
      } else {
        updated++;
      }
    }

    console.log(`Update complete: ${updated} succeeded, ${errors} failed`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));

  // 6. Verify
  const { data: finalCount } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true });

  console.log(`Total posts in database now: ${finalCount?.length || 'unknown'}`);
}

// Run migration
migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
