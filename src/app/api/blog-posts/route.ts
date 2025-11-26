import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read blog posts from JSON file
    const filePath = path.join(process.cwd(), 'all_blog_posts_with_content.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('Blog posts JSON file not found:', filePath);
      return NextResponse.json({ error: 'Blog posts data not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(fileContent);

    // Process posts to add local image paths and ensure proper format
    const processedPosts = posts.map((post: any) => {
      let featured_image_local = null;
      
      if (post.featured_media && post.featured_media > 0) {
        // Try to find local image based on post slug or title
        const slug = post.slug;
        const title = post.title;
        
        // Common patterns for local images - check both compressed and main directory
        const possibleImageNames = [
          `post_${post.wp_id}_${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`,
          `post_${post.wp_id}_${slug}`,
          slug,
          title.toLowerCase().replace(/[^a-z0-9]/g, '_')
        ];
        
        // Try to find the image in the main blog-images directory first
        const fs = require('fs');
        const path = require('path');
        const blogImagesDir = path.join(process.cwd(), 'public', 'blog-images');
        
        for (const imageName of possibleImageNames) {
          const imagePath = path.join(blogImagesDir, `${imageName}.jpg`);
          if (fs.existsSync(imagePath)) {
            featured_image_local = `/blog-images/${imageName}.jpg`;
            break;
          }
        }
        
        // If no specific image found, use a default placeholder
        if (!featured_image_local) {
          featured_image_local = '/blog-images/post_28580_What_is_Nicotine_The_Ultimate_Guide.jpg';
        }
      }
      
      return {
        ...post,
        featured_image_local,
        // Ensure we have all required fields
        link: post.link || `https://nicotine-pouches.org/${post.slug}`,
        excerpt: post.excerpt || '',
        author: post.author || 'Nicotine Pouches Team'
      };
    });

    // Filter only published posts
    const publishedPosts = processedPosts.filter((post: any) => 
      post.status === 'publish' && post.type === 'post'
    );

    // Sort by date (newest first)
    publishedPosts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(publishedPosts);
  } catch (error) {
    console.error('Error in blog posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
