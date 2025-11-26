import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Read blog posts from JSON file
    const filePath = path.join(process.cwd(), 'all_blog_posts_with_content.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('Blog posts JSON file not found:', filePath);
      return NextResponse.json({ error: 'Blog posts data not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(fileContent);

    // Find the specific blog post by slug
    const post = posts.find((p: any) => p.slug === slug && p.status === 'publish' && p.type === 'post');

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Add local image path
    let featured_image_local = null;
    if (post.featured_media && post.featured_media > 0) {
      const possibleImageNames = [
        `post_${post.wp_id}_${post.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`,
        `post_${post.wp_id}_${post.slug}`,
        post.slug,
        post.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
      ];
      
      // Try to find the image in the main blog-images directory
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

    const processedPost = {
      ...post,
      featured_image_local,
      // Ensure we have all required fields
      link: post.link || `https://nicotine-pouches.org/${post.slug}`,
      excerpt: post.excerpt || '',
      author: post.author || 'Nicotine Pouches Team'
    };

    return NextResponse.json(processedPost);
  } catch (error) {
    console.error('Error in blog post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
