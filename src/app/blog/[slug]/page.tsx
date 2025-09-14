import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

interface BlogPost {
  wp_id: number;
  title: string;
  link: string;
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
  featured_image_compressed?: string;
  seo_meta?: {
    url: string;
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    canonical: string;
    robots: string;
    author: string;
    published_time: string;
    modified_time: string;
    article_section: string;
    article_tags: string[];
  };
}

// Load extracted blog posts data
const loadBlogPosts = (): BlogPost[] => {
  try {
    const filePath = path.join(process.cwd(), 'all_blog_posts_complete.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
};

// Get blog post by slug
const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  const posts = loadBlogPosts();
  return posts.find(post => post.slug === slug) || null;
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Clean HTML content for display
const cleanHtmlContent = (html: string): string => {
  // Remove WordPress-specific classes and clean up the content
  return html
    .replace(/class="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
    .replace(/<div[^>]*>/g, '<div>')
    .replace(/<span[^>]*>/g, '<span>')
    .replace(/<p[^>]*>/g, '<p>')
    .replace(/<h[1-6][^>]*>/g, (match) => {
      const level = match.charAt(2);
      return `<h${level}>`;
    })
    .replace(/<ul[^>]*>/g, '<ul>')
    .replace(/<ol[^>]*>/g, '<ol>')
    .replace(/<li[^>]*>/g, '<li>')
    .replace(/<table[^>]*>/g, '<table>')
    .replace(/<tr[^>]*>/g, '<tr>')
    .replace(/<td[^>]*>/g, '<td>')
    .replace(/<th[^>]*>/g, '<th>')
    .replace(/<a[^>]*>/g, '<a>')
    .replace(/<img[^>]*>/g, '<img>')
    .replace(/<br[^>]*>/g, '<br>')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "...");
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    notFound();
  }

  // Use SEO meta title if available, otherwise use WordPress title
  const displayTitle = post.seo_meta?.title || post.title;
  const displayDescription = post.seo_meta?.description || post.excerpt.replace(/<[^>]*>/g, '');
  
  // Debug logging
  console.log('Post data:', {
    wp_id: post.wp_id,
    title: post.title,
    featured_image_local: post.featured_image_local,
    seo_meta_og_image: post.seo_meta?.og_image
  });
  
  const displayImage = post.featured_image_local || post.seo_meta?.og_image || 'https://via.placeholder.com/1200x400/f3f4f6/666666?text=Nicotine+Pouches+Guide';

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content Container - Centered like Klarna */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Blog Post Header - Left Aligned with Content */}
        <div style={{
          padding: '40px 0 20px 0',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            margin: '0 0 8px 0',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            {displayTitle}
          </h1>
          
          <div style={{ 
            fontSize: '18px', 
            color: '#666', 
            marginBottom: '20px',
            fontWeight: '400',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            by {post.seo_meta?.author || 'Nicotine Pouches Team'} • {formatDate(post.date)}
          </div>
        </div>

        {/* Featured Image Section */}
        <div style={{
          padding: '20px 0',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <img 
            src={displayImage}
            alt={displayTitle}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Main Content */}
        <div style={{
          padding: '20px 0 40px 0',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Description/Excerpt */}
          {displayDescription && (
            <div style={{
              fontSize: '20px',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.6',
              fontFamily: 'Klarna Text, sans-serif',
              fontStyle: 'italic'
            }}>
              {displayDescription}
            </div>
          )}
          
          <div 
            className="blog-post-content"
            style={{ 
              color: '#333', 
              lineHeight: '1.8', 
              fontSize: '18px',
              fontFamily: 'Klarna Text, sans-serif'
            }}
            dangerouslySetInnerHTML={{ 
              __html: cleanHtmlContent(post.excerpt)
                .replace(
                  /<h2>/g, 
                  '<h2 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin: 50px 0 20px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.3; display: block;">'
                )
                .replace(
                  /<h3>/g, 
                  '<h3 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 12px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.4; display: block;">'
                )
                .replace(
                  /<h4>/g, 
                  '<h4 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 25px 0 10px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.4; display: block;">'
                )
                .replace(
                  /<ul>/g, 
                  '<ul style="margin: 20px 0; padding-left: 20px; font-family: \'Klarna Text\', sans-serif;">'
                )
                .replace(
                  /<ol>/g, 
                  '<ol style="margin: 20px 0; padding-left: 20px; font-family: \'Klarna Text\', sans-serif;">'
                )
                .replace(
                  /<li>/g, 
                  '<li style="margin: 8px 0; font-size: 18px; line-height: 1.6; color: #333; list-style-type: disc;">'
                )
                .replace(
                  /<p>/g, 
                  '<p style="margin: 15px 0; font-size: 18px; line-height: 1.8; color: #333; font-family: \'Klarna Text\', sans-serif;">'
                )
                .replace(
                  /<table>/g, 
                  '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: \'Klarna Text\', sans-serif; border: 1px solid #e5e7eb;">'
                )
                .replace(
                  /<th>/g, 
                  '<th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 600; background-color: #f8f9fa;">'
                )
                .replace(
                  /<td>/g, 
                  '<td style="border: 1px solid #e5e7eb; padding: 12px; font-weight: 500;">'
                )
                .replace(
                  /<tr>/g, 
                  '<tr style="border-bottom: 1px solid #e5e7eb;">'
                )
                .replace(
                  /<a>/g, 
                  '<a style="color: #2563eb; text-decoration: underline; font-weight: 500;">'
                )
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}