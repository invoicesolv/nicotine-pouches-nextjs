#!/usr/bin/env node
/**
 * Convert blog post images to WebP and compress if over 1MB
 * - Downloads original jpg/jpeg/png images from Supabase storage
 * - Converts to WebP format
 * - Compresses if over 1MB
 * - Re-uploads to Supabase storage as .webp
 * - Updates database URLs
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const https = require('https');
const http = require('http');

// Supabase credentials
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const SIZE_THRESHOLD = 1024 * 1024; // 1MB in bytes
const WEBP_QUALITY = 85;
const MAX_WIDTH = 1200; // Max width for blog images

// Stats tracking
const stats = {
  totalPosts: 0,
  imagesProcessed: 0,
  imagesCompressed: 0,
  imagesConverted: 0,
  imagesSkipped: 0,
  alreadyWebp: 0,
  totalOriginalSize: 0,
  totalNewSize: 0,
  errors: 0
};

/**
 * Download image from URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Process and compress image
 */
async function processImage(imageBuffer, originalSize) {
  const needsCompression = originalSize > SIZE_THRESHOLD;

  let sharpInstance = sharp(imageBuffer);
  const metadata = await sharpInstance.metadata();

  // Resize if width is larger than MAX_WIDTH
  if (metadata.width && metadata.width > MAX_WIDTH) {
    sharpInstance = sharpInstance.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    });
  }

  // Convert to WebP with appropriate quality
  const quality = needsCompression ? 80 : WEBP_QUALITY;
  const webpBuffer = await sharpInstance
    .webp({
      quality: quality,
      effort: 6,
      smartSubsample: true
    })
    .toBuffer();

  return {
    buffer: webpBuffer,
    wasCompressed: needsCompression,
    originalSize,
    newSize: webpBuffer.length
  };
}

/**
 * Upload image to Supabase storage
 */
async function uploadToSupabase(buffer, path) {
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(path, buffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
}

/**
 * Extract storage path from URL
 */
function getStoragePath(url) {
  // URL format: https://xxx.supabase.co/storage/v1/object/public/blog-images/featured/filename.jpg
  const match = url.match(/\/blog-images\/(.+)$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Try to get original image URL (convert .webp back to original extensions)
 */
function getOriginalUrls(webpUrl) {
  const baseUrl = webpUrl.replace(/\.webp$/i, '');
  return [
    baseUrl + '.jpg',
    baseUrl + '.jpeg',
    baseUrl + '.png'
  ];
}

/**
 * Process a single featured image
 */
async function processFeaturedImage(post) {
  const url = post.featured_image;

  // Skip non-Supabase URLs
  if (!url || !url.includes('supabase.co/storage')) {
    console.log(`   ⏭️ External URL, skipping`);
    stats.imagesSkipped++;
    return null;
  }

  // Check if URL already ends with .webp
  const isWebpUrl = /\.webp$/i.test(url);

  let originalUrl = url;
  let targetWebpUrl = url;

  if (isWebpUrl) {
    // URL is .webp, try to find the original jpg/jpeg/png file
    const possibleUrls = getOriginalUrls(url);
    let foundOriginal = false;

    for (const tryUrl of possibleUrls) {
      try {
        const testBuffer = await downloadImage(tryUrl);
        if (testBuffer && testBuffer.length > 0) {
          originalUrl = tryUrl;
          foundOriginal = true;
          console.log(`   📍 Found original: ${tryUrl.split('/').pop()}`);
          break;
        }
      } catch (e) {
        // Try next extension
      }
    }

    if (!foundOriginal) {
      // Check if webp file already exists
      try {
        const webpBuffer = await downloadImage(url);
        if (webpBuffer && webpBuffer.length > 0) {
          console.log(`   ✓ Already WebP (${formatBytes(webpBuffer.length)})`);
          stats.alreadyWebp++;
          return null;
        }
      } catch (e) {
        console.log(`   ⚠️ Image not found in storage`);
        stats.errors++;
        return null;
      }
    }
  }

  try {
    console.log(`   📥 Downloading: ${originalUrl.split('/').pop()}`);
    const imageBuffer = await downloadImage(originalUrl);
    const originalSize = imageBuffer.length;
    stats.totalOriginalSize += originalSize;

    console.log(`   📊 Original size: ${formatBytes(originalSize)}`);

    console.log(`   🔄 Converting to WebP...`);
    const result = await processImage(imageBuffer, originalSize);
    stats.totalNewSize += result.newSize;

    const reduction = ((originalSize - result.newSize) / originalSize * 100).toFixed(1);
    console.log(`   📊 New size: ${formatBytes(result.newSize)} (${reduction}% reduction)`);

    if (result.wasCompressed) {
      console.log(`   🗜️ Extra compression applied (was over 1MB)`);
      stats.imagesCompressed++;
    }

    // Get storage path and create new webp path
    const originalPath = getStoragePath(originalUrl);
    if (!originalPath) {
      console.log(`   ⚠️ Could not parse storage path`);
      return null;
    }

    const webpPath = originalPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    console.log(`   📤 Uploading: ${webpPath}`);
    await uploadToSupabase(result.buffer, webpPath);

    // Build new URL
    const newUrl = originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    console.log(`   ✅ Uploaded successfully`);

    stats.imagesConverted++;
    stats.imagesProcessed++;

    return { newUrl, processed: true };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    stats.errors++;
    return null;
  }
}

/**
 * Main conversion function
 */
async function convertBlogImagesToWebp() {
  console.log('🔄 Starting blog post image conversion and compression...\n');
  console.log('Configuration:');
  console.log(`   - Compression threshold: ${formatBytes(SIZE_THRESHOLD)}`);
  console.log(`   - WebP quality: ${WEBP_QUALITY}`);
  console.log(`   - Max width: ${MAX_WIDTH}px`);
  console.log('\n' + '='.repeat(60));

  try {
    // Fetch all blog posts with Supabase storage featured images
    console.log('\n📥 Fetching blog posts with Supabase storage images...');
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, featured_image')
      .not('featured_image', 'is', null)
      .ilike('featured_image', '%supabase.co/storage%')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      process.exit(1);
    }

    stats.totalPosts = posts.length;
    console.log(`✅ Found ${stats.totalPosts} posts with Supabase storage images\n`);
    console.log('='.repeat(60));

    // Process each post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      console.log(`\n[${i + 1}/${stats.totalPosts}] "${post.title?.substring(0, 45) || 'Untitled'}..."`);
      console.log(`   ID: ${post.id}`);

      const result = await processFeaturedImage(post);

      if (result && result.newUrl && result.newUrl !== post.featured_image) {
        // Update database with new URL
        console.log(`   💾 Updating database...`);
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ featured_image: result.newUrl })
          .eq('id', post.id);

        if (updateError) {
          console.log(`   ❌ Database update failed: ${updateError.message}`);
          stats.errors++;
        } else {
          console.log(`   ✅ Database updated`);
        }
      }

      // Add a small delay to avoid rate limiting
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Print summary
    printSummary();

  } catch (err) {
    console.error('\n❌ Script error:', err);
    process.exit(1);
  }
}

/**
 * Print conversion summary
 */
function printSummary() {
  const savedBytes = stats.totalOriginalSize - stats.totalNewSize;
  const savedPercent = stats.totalOriginalSize > 0
    ? ((savedBytes / stats.totalOriginalSize) * 100).toFixed(1)
    : 0;

  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal posts checked: ${stats.totalPosts}`);
  console.log(`Images processed & converted: ${stats.imagesProcessed}`);
  console.log(`Images compressed (>1MB): ${stats.imagesCompressed}`);
  console.log(`Already WebP: ${stats.alreadyWebp}`);
  console.log(`Skipped (external): ${stats.imagesSkipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('');
  if (stats.totalOriginalSize > 0) {
    console.log('Storage savings:');
    console.log(`   Original total: ${formatBytes(stats.totalOriginalSize)}`);
    console.log(`   New total: ${formatBytes(stats.totalNewSize)}`);
    console.log(`   Saved: ${formatBytes(savedBytes)} (${savedPercent}%)`);
  }
  console.log('');
  console.log('='.repeat(60));

  if (stats.errors === 0) {
    console.log('🎉 Conversion completed successfully!');
  } else {
    console.log(`⚠️ Conversion completed with ${stats.errors} error(s)`);
  }
  console.log('='.repeat(60));
}

// Run the script
convertBlogImagesToWebp();
