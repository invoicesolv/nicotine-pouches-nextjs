import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'all_blog_posts_complete.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(fileContents);
    
    // Use the full content with local images from the updated JSON file
    const postsWithContent = posts.map((post: any) => {
      return {
        ...post,
        content: post.content || post.excerpt, // Use full content if available, fallback to excerpt
        fullContent: post.content || post.excerpt
      };
    });
    
    return NextResponse.json(postsWithContent);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
