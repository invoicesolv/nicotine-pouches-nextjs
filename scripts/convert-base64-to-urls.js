#!/usr/bin/env node
/**
 * Convert base64 featured images to Supabase Storage URLs
 *
 * This script:
 * 1. Finds all posts with base64 images (data:image/...)
 * 2. Uploads them to Supabase Storage
 * 3. Updates the database with the new URLs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket name
const BUCKET_NAME = 'blog-images';

// Parse command line args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = args.find(a => a.startsWith('--limit='))?.split('=')[1] || null;

async function ensureBucketExists() {
  console.log(`Checking if bucket '${BUCKET_NAME}' exists...`);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    return false;
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`Creating bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return false;
    }
    console.log('Bucket created successfully');
  } else {
    console.log('Bucket already exists');
  }

  return true;
}

function extractBase64Info(dataUrl) {
  // Parse data:image/jpeg;base64,/9j/4AAQ...
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;

  return {
    mimeType: `image/${matches[1]}`,
    extension: matches[1] === 'jpeg' ? 'jpg' : matches[1],
    base64Data: matches[2]
  };
}

async function uploadBase64ToStorage(base64DataUrl, postId, slug) {
  const info = extractBase64Info(base64DataUrl);
  if (!info) {
    console.error(`  Invalid base64 format for post ${postId}`);
    return null;
  }

  // Convert base64 to buffer
  const buffer = Buffer.from(info.base64Data, 'base64');

  // Generate filename
  const timestamp = Date.now();
  const filename = `featured/${slug || postId}-${timestamp}.${info.extension}`;

  console.log(`  Uploading ${filename} (${(buffer.length / 1024).toFixed(1)} KB)...`);

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upload to: ${filename}`);
    return `https://vyolbmzuezpoqtdgongz.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, {
      contentType: info.mimeType,
      upsert: true
    });

  if (error) {
    console.error(`  Upload error:`, error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

async function convertBase64Images() {
  console.log('===========================================');
  console.log('Base64 to URL Converter');
  console.log('===========================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}`);
  console.log('');

  // Ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady && !DRY_RUN) {
    console.error('Cannot proceed without storage bucket');
    process.exit(1);
  }

  // Find all posts with base64 images
  console.log('\nFinding posts with base64 images...');

  let query = supabase
    .from('blog_posts')
    .select('id, wp_id, slug, title, featured_image')
    .like('featured_image', 'data:image%')
    .order('id', { ascending: true });

  if (LIMIT) {
    query = query.limit(parseInt(LIMIT));
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    process.exit(1);
  }

  console.log(`Found ${posts.length} posts with base64 images\n`);

  if (posts.length === 0) {
    console.log('No base64 images to convert!');
    return;
  }

  // Process each post
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] Processing: ${post.title?.substring(0, 50)}...`);
    console.log(`  ID: ${post.id}, wp_id: ${post.wp_id || 'NULL'}, slug: ${post.slug}`);

    // Upload to storage
    const newUrl = await uploadBase64ToStorage(post.featured_image, post.id, post.slug);

    if (!newUrl) {
      console.log(`  ❌ Failed to upload\n`);
      errorCount++;
      results.push({ id: post.id, slug: post.slug, status: 'error', error: 'Upload failed' });
      continue;
    }

    console.log(`  New URL: ${newUrl}`);

    // Update database
    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          featured_image: newUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (updateError) {
        console.log(`  ❌ Database update failed: ${updateError.message}\n`);
        errorCount++;
        results.push({ id: post.id, slug: post.slug, status: 'error', error: updateError.message });
        continue;
      }
    }

    console.log(`  ✅ Success\n`);
    successCount++;
    results.push({ id: post.id, slug: post.slug, status: 'success', newUrl });
  }

  // Summary
  console.log('===========================================');
  console.log('SUMMARY');
  console.log('===========================================');
  console.log(`Total processed: ${posts.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN - No actual changes made');
    console.log('Run without --dry-run to apply changes');
  }

  // Save results to file
  const resultsPath = path.join(process.env.HOME, 'Desktop', 'base64_conversion_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);
}

convertBase64Images().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
