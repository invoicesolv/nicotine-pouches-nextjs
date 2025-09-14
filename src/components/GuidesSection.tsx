'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  wp_id: number;
  title: string;
  link: string;
  excerpt: string;
  content: string;
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
const loadBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch('/api/blog-posts');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
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
const cleanExcerpt = (html: string): string => {
  let cleanedHtml = html
    .replace(/https:\/\/nicotine-pouches\.org\/wp-content\/uploads\/[^"'\s]+/g, (match) => {
      const filename = match.split('/').pop()?.split('?')[0] || '';
      return `/blog-images/compressed/${filename}`;
    })
    .replace(/https:\/\/[^"'\s]*\.(jpg|jpeg|png|gif|webp|avif)(\?[^"'\s]*)?/g, (match) => {
      const filename = match.split('/').pop()?.split('?')[0] || '';
      return `/blog-images/compressed/${filename}`;
    });

  return cleanedHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "...")
    .substring(0, 120) + '...';
};

export default function GuidesSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await loadBlogPosts();
      // Sort by date and take only the first 4 for homepage
      const sortedPosts = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(sortedPosts.slice(0, 4));
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '60px 0',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#666',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            Loading guides...
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '60px 0',
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)'
    }}>
      <div style={{
        width: '100%',
        padding: '0 40px'
      }}>
        
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: '0 0 15px 0',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            Latest Guides
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#666',
            margin: '0 0 30px 0',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            Expert insights and tips for nicotine pouch users
          </p>
          <Link href="/guides" style={{
            display: 'inline-block',
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Klarna Text, sans-serif',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
          }}
          >
            View All Guides
          </Link>
        </div>

        {/* Guides Grid - Same as guides page */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {posts.map((post) => {
            const displayTitle = post.seo_meta?.title || post.title;
            const displayDescription = post.seo_meta?.description || cleanExcerpt(post.excerpt);
            
            const displayImage = post.featured_image_local || 
              (post.seo_meta?.og_image ? 
                post.seo_meta.og_image.replace(/https:\/\/nicotine-pouches\.org\/wp-content\/uploads\/[^"'\s]+/, (match) => {
                  const filename = match.split('/').pop()?.split('?')[0] || '';
                  return `/blog-images/compressed/${filename}`;
                }) : null) || '/blog-images/compressed/post_28580_What_is_Nicotine_The_Ultimate_Guide.jpg';
            
            return (
              <Link 
                key={post.wp_id} 
                href={`/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article style={{
                  backgroundColor: 'transparent',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  {/* Featured Image - Separated from title */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    marginBottom: '20px'
                  }}>
                    <img 
                      src={displayImage}
                      alt={displayTitle}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '16px'
                      }}
                    />
                  </div>
                  
                  {/* Content - No padding, no background */}
                  <div>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 15px 0',
                      fontFamily: 'Klarna Text, sans-serif',
                      lineHeight: '1.3'
                    }}>
                      {displayTitle}
                    </h3>
                    
                    <p style={{
                      fontSize: '16px',
                      color: '#666',
                      margin: '0 0 20px 0',
                      fontFamily: 'Klarna Text, sans-serif',
                      lineHeight: '1.6'
                    }}>
                      {displayDescription}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#999',
                      fontFamily: 'Klarna Text, sans-serif'
                    }}>
                      <span>{formatDate(post.date)}</span>
                      <span>Read more →</span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
