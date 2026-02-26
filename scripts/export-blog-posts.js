#!/usr/bin/env node
/**
 * Export all blog_posts to CSV to analyze empty fields
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials from the codebase
const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Output path - Desktop
const outputPath = path.join(process.env.HOME, 'Desktop', 'blog_posts_export.csv');

async function exportBlogPosts() {
  console.log('Fetching all blog posts from Supabase...');

  try {
    // Fetch all posts
    const { data: posts, error, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching posts:', error);
      process.exit(1);
    }

    console.log(`Found ${posts.length} posts (count: ${count})`);

    if (posts.length === 0) {
      console.log('No posts found!');
      process.exit(0);
    }

    // Get all column names from first row
    const columns = Object.keys(posts[0]);
    console.log('Columns:', columns.join(', '));

    // Create CSV content
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Check if content length and truncate for readability
      const truncated = str.length > 200 ? str.substring(0, 200) + '...[TRUNCATED]' : str;
      // Escape quotes and wrap in quotes if contains comma, newline or quote
      if (truncated.includes(',') || truncated.includes('\n') || truncated.includes('"')) {
        return '"' + truncated.replace(/"/g, '""') + '"';
      }
      return truncated;
    };

    // Build CSV
    let csv = columns.join(',') + '\n';

    // Add analysis columns
    const analysisColumns = [
      'id',
      'wp_id',
      'title',
      'slug',
      'status',
      'has_content',
      'content_length',
      'has_excerpt',
      'excerpt_length',
      'has_featured_image',
      'has_seo_meta',
      'date',
      'created_at'
    ];

    let analysisCsv = analysisColumns.join(',') + '\n';

    for (const post of posts) {
      // Full export row
      const row = columns.map(col => escapeCSV(post[col]));
      csv += row.join(',') + '\n';

      // Analysis row (checking for empty fields)
      const analysisRow = [
        post.id,
        post.wp_id || 'NULL',
        escapeCSV(post.title || ''),
        post.slug || '',
        post.status || 'NULL',
        post.content ? 'YES' : 'NO',
        post.content ? post.content.length : 0,
        post.excerpt ? 'YES' : 'NO',
        post.excerpt ? post.excerpt.length : 0,
        post.featured_image ? 'YES' : 'NO',
        post.seo_meta ? 'YES' : 'NO',
        post.date || 'NULL',
        post.created_at || 'NULL'
      ];
      analysisCsv += analysisRow.join(',') + '\n';
    }

    // Write full export
    fs.writeFileSync(outputPath, csv);
    console.log(`\nFull export saved to: ${outputPath}`);

    // Write analysis export
    const analysisPath = path.join(process.env.HOME, 'Desktop', 'blog_posts_analysis.csv');
    fs.writeFileSync(analysisPath, analysisCsv);
    console.log(`Analysis export saved to: ${analysisPath}`);

    // Print summary statistics
    console.log('\n=== SUMMARY ===');
    console.log(`Total posts: ${posts.length}`);

    const withContent = posts.filter(p => p.content && p.content.length > 0).length;
    const withoutContent = posts.length - withContent;
    console.log(`Posts WITH content: ${withContent}`);
    console.log(`Posts WITHOUT content: ${withoutContent}`);

    const withExcerpt = posts.filter(p => p.excerpt && p.excerpt.length > 0).length;
    console.log(`Posts with excerpt: ${withExcerpt}`);

    const withImage = posts.filter(p => p.featured_image).length;
    console.log(`Posts with featured_image: ${withImage}`);

    const withSeoMeta = posts.filter(p => p.seo_meta).length;
    console.log(`Posts with seo_meta: ${withSeoMeta}`);

    // Status breakdown
    const statusCounts = {};
    posts.forEach(p => {
      const status = p.status || 'NULL';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log('\nStatus breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // List posts without content
    const emptyPosts = posts.filter(p => !p.content || p.content.length === 0);
    if (emptyPosts.length > 0) {
      console.log(`\n=== POSTS WITHOUT CONTENT (${emptyPosts.length}) ===`);
      emptyPosts.slice(0, 20).forEach(p => {
        console.log(`  ID: ${p.id}, wp_id: ${p.wp_id || 'NULL'}, title: ${(p.title || '').substring(0, 50)}`);
      });
      if (emptyPosts.length > 20) {
        console.log(`  ... and ${emptyPosts.length - 20} more`);
      }
    }

    console.log('\n=== DONE ===');

  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

exportBlogPosts();
