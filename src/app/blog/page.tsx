'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

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
    .replace(/&#8230;/g, "...")
    .substring(0, 150) + '...';
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsData = await getBlogPosts();
      setPosts(postsData);
      setLoading(false);
    };
    fetchPosts();
  }, []);

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
          Loading blog posts...
        </div>
        <Footer />
      </div>
    );
  }
  
  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        
        {/* Page Header */}
        <div style={{
          padding: '60px 0 40px 0',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0 0 20px 0',
            fontFamily: 'Klarna Text, sans-serif',
            lineHeight: '1.2'
          }}>
            Nicotine Pouches Blog
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#666',
            margin: '0 0 40px 0',
            fontFamily: 'Klarna Text, sans-serif',
            lineHeight: '1.6'
          }}>
            Everything you need to know about nicotine pouches, brands, and more
          </p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
              fontFamily: 'Klarna Text, sans-serif'
            }}>
              Categories:
            </span>
            <select style={{
              padding: '8px 16px',
              borderRadius: '25px',
              border: '2px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Klarna Text, sans-serif',
              cursor: 'pointer'
            }}>
              <option>All Categories</option>
              <option>Nicotine Pouches</option>
              <option>Brands</option>
              <option>Health & Safety</option>
              <option>Reviews</option>
            </select>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
              fontFamily: 'Klarna Text, sans-serif'
            }}>
              Sort by:
            </span>
            <select style={{
              padding: '8px 16px',
              borderRadius: '25px',
              border: '2px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Klarna Text, sans-serif',
              cursor: 'pointer'
            }}>
              <option>Newest</option>
              <option>Oldest</option>
              <option>Most Popular</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {sortedPosts.map((post) => {
            const displayTitle = post.seo_meta?.title || post.title;
            const displayDescription = post.seo_meta?.description || cleanExcerpt(post.excerpt);
            const displayImage = post.featured_image_local || post.seo_meta?.og_image || 'https://via.placeholder.com/400x250/f3f4f6/666666?text=Nicotine+Pouches';
            
            return (
              <Link 
                key={post.wp_id} 
                href={`/blog/${post.slug}`}
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
                  {/* Featured Image */}
                  <div style={{
                    width: '100%',
                    height: '250px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={displayImage}
                      alt={displayTitle}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0'
                      }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div style={{
                    padding: '25px'
                  }}>
                    <h2 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 15px 0',
                      fontFamily: 'Klarna Text, sans-serif',
                      lineHeight: '1.3'
                    }}>
                      {displayTitle}
                    </h2>
                    
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

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '60px'
        }}>
          <button style={{
            padding: '10px 20px',
            borderRadius: '25px',
            border: '2px solid #e5e7eb',
            backgroundColor: '#ffffff',
            fontSize: '14px',
            fontFamily: 'Klarna Text, sans-serif',
            cursor: 'pointer',
            color: '#666'
          }}>
            Previous
          </button>
          
          <div style={{
            display: 'flex',
            gap: '5px'
          }}>
            {[1, 2, 3, 4, 5].map((page) => (
              <button 
                key={page}
                style={{
                  padding: '10px 15px',
                  borderRadius: '25px',
                  border: page === 1 ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  backgroundColor: page === 1 ? '#2563eb' : '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Klarna Text, sans-serif',
                  cursor: 'pointer',
                  color: page === 1 ? '#ffffff' : '#666'
                }}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button style={{
            padding: '10px 20px',
            borderRadius: '25px',
            border: '2px solid #e5e7eb',
            backgroundColor: '#ffffff',
            fontSize: '14px',
            fontFamily: 'Klarna Text, sans-serif',
            cursor: 'pointer',
            color: '#666'
          }}>
            Next
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}