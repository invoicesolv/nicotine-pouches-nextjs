'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

// Get blog posts from API
const getBlogPosts = async (): Promise<BlogPost[]> => {
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
  return html
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
    .replace(/&#8230;/g, "...");
};

export default function USBlogPost() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const posts = await getBlogPosts();
      const foundPost = posts.find(p => p.slug === params.slug);
      setPost(foundPost || null);
      setLoading(false);
    };
    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          fontFamily: 'Klarna Text, sans-serif'
        }}>
          Loading blog post...
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          fontFamily: 'Klarna Text, sans-serif'
        }}>
          Blog post not found
        </div>
        <Footer />
      </div>
    );
  }

  const displayTitle = post.seo_meta?.title || post.title;
  const displayDescription = post.seo_meta?.description || cleanExcerpt(post.excerpt);
  const displayImage = post.featured_image_local || post.seo_meta?.og_image || 'https://via.placeholder.com/800x400/f3f4f6/666666?text=Nicotine+Pouches';

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Breadcrumb */}
        <div style={{
          padding: '20px 0',
          fontSize: '16px',
          color: '#666'
        }}>
          <Link href="/us" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>»</span>
          <Link href="/us/blog" style={{ color: '#666', textDecoration: 'none' }}>Blog (US)</Link>
          <span style={{ margin: '0 8px' }}>»</span>
          <span>{displayTitle}</span>
        </div>

        {/* Article Header */}
        <article style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '60px'
        }}>
          {/* Featured Image */}
          <div style={{
            width: '100%',
            height: '400px',
            overflow: 'hidden'
          }}>
            <img 
              src={displayImage}
              alt={displayTitle}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* Content */}
          <div style={{
            padding: '40px'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 20px 0',
              fontFamily: 'Klarna Text, sans-serif',
              lineHeight: '1.2'
            }}>
              {displayTitle}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '30px',
              fontSize: '16px',
              color: '#666',
              fontFamily: 'Klarna Text, sans-serif'
            }}>
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.seo_meta?.author || 'Nicotine Pouches Team'}</span>
              <span>•</span>
              <span>US Market</span>
            </div>
            
            <div style={{
              fontSize: '18px',
              color: '#333',
              lineHeight: '1.8',
              fontFamily: 'Klarna Text, sans-serif',
              marginBottom: '30px'
            }}>
              {displayDescription}
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #22c55e',
              marginBottom: '30px'
            }}>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: '#333',
                fontFamily: 'Klarna Text, sans-serif'
              }}>
                This article focuses on nicotine pouches available in the US market. All products mentioned are legal for adults 21+ in the United States.
              </p>
            </div>

            <div style={{
              fontSize: '16px',
              color: '#333',
              lineHeight: '1.8',
              fontFamily: 'Klarna Text, sans-serif'
            }}>
              <p>This is a sample blog post content. In a real implementation, this would contain the full blog post content from your CMS or API.</p>
              
              <p>For the US market, we focus on products that are legally available and comply with all applicable regulations. Our content is tailored specifically for US consumers who are looking for nicotine pouch options that meet their needs and preferences.</p>
              
              <p>Whether you're new to nicotine pouches or looking to explore different options available in the United States, our comprehensive guides and reviews help you make informed decisions about the products that are right for you.</p>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div style={{
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0 0 30px 0',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            Related Articles (US)
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {/* Sample related posts */}
            {[1, 2, 3].map((i) => (
              <Link 
                key={i}
                href={`/us/blog/sample-post-${i}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }}
                >
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '16px'
                  }}>
                    Sample Image {i}
                  </div>
                  
                  <div style={{
                    padding: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      margin: '0 0 10px 0',
                      fontFamily: 'Klarna Text, sans-serif'
                    }}>
                      Related Article {i} (US)
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: '0',
                      fontFamily: 'Klarna Text, sans-serif'
                    }}>
                      Sample description for related article {i} focusing on US market...
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
