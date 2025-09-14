import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Load both files
    const completeFilePath = path.join(process.cwd(), 'all_blog_posts_complete.json');
    const mergedFilePath = path.join(process.cwd(), 'all_blog_posts_merged.json');
    
    const completeFileContents = fs.readFileSync(completeFilePath, 'utf8');
    const mergedFileContents = fs.readFileSync(mergedFilePath, 'utf8');
    
    const completePosts = JSON.parse(completeFileContents);
    const mergedPosts = JSON.parse(mergedFileContents);
    
    // Create a map of merged posts by slug for quick lookup
    const mergedPostsMap = new Map();
    mergedPosts.forEach((post: any) => {
      mergedPostsMap.set(post.slug, post);
    });
    
    // Merge the data: use complete posts as base, add content from merged posts
    const mergedData = completePosts.map((post: any) => {
      const mergedPost = mergedPostsMap.get(post.slug);
      return {
        ...post,
        content: mergedPost?.content || post.content || post.excerpt,
        fullContent: mergedPost?.content || post.content || post.excerpt
      };
    });
    
    return NextResponse.json(mergedData);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}
