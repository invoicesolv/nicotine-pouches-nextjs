'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GuidesSearchBar from './GuidesSearchBar';

// Extend Window interface for search timeout
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
  }
}

interface BlogPost {
  wp_id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  featured_image: string;
  featured_image_local?: string;
  featured_media?: number;
  seo_meta?: {
    title?: string;
    description?: string;
  };
}

export default function GuidesClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const postsPerPage = 12;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog-posts');
        if (response.ok) {
          const data = await response.json();
          console.log('GuidesClient: Loaded posts:', data.length);
          console.log('GuidesClient: First post featured_image_local:', data[0]?.featured_image_local);
          console.log('GuidesClient: First post featured_media:', data[0]?.featured_media);
          setPosts(data);
          setFilteredPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Search functionality with debouncing for live search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Show searching state for live search
    if (query.trim()) {
      setSearching(true);
    }
    
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounce the search to avoid too many updates
    window.searchTimeout = setTimeout(() => {
      if (!query.trim()) {
        setFilteredPosts(posts);
        setSearching(false);
        return;
      }
      
      const filtered = posts.filter(post => {
        const title = post.title.toLowerCase();
        const excerpt = post.excerpt.toLowerCase();
        const searchTerm = query.toLowerCase();
        
        return title.includes(searchTerm) || 
               excerpt.includes(searchTerm);
      });
      
      setFilteredPosts(filtered);
      setSearching(false);
    }, 150); // 150ms delay for live search
  };

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
      }}>
        <div style={{
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          Loading guides...
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 16px 0',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>
          No guides found
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#666',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>
          We're working on creating comprehensive guides for you. Check back soon!
        </p>
      </div>
    );
  }

  // Sort posts by date (newest first)
  const sortedPosts = filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate pagination
  const totalPosts = sortedPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of posts section
    const postsSection = document.getElementById('guides-posts-section');
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Search Bar */}
      <GuidesSearchBar onSearch={handleSearch} />

      {/* Search Results Info */}
      {searchQuery && (
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          padding: '0 20px'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#666',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            margin: '0'
          }}>
            {searching ? (
              'Searching...'
            ) : sortedPosts.length === 0 ? (
              `No guides found for "${searchQuery}"`
            ) : (
              `Found ${sortedPosts.length} guide${sortedPosts.length === 1 ? '' : 's'} for "${searchQuery}"`
            )}
          </p>
        </div>
      )}

      <div id="guides-posts-section" className="guides-page-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '30px'
      }}>
        {paginatedPosts.map((post) => {
        const displayTitle = post.seo_meta?.title || post.title;
        // Try to construct the correct image path
        let displayImage = post.featured_image_local;
        
        if (!displayImage && post.featured_media && post.featured_media > 0) {
          // Try to find the image based on post data
          const possibleImageNames = [
            `post_${post.wp_id}_${post.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`,
            `post_${post.wp_id}_${post.slug}`,
            post.slug,
            post.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
          ];
          
          // Use the first pattern as default
          displayImage = `/blog-images/${possibleImageNames[0]}.jpg`;
          console.log('GuidesClient: Constructed image path for post', post.wp_id, ':', displayImage);
        }
        
        // Fallback to default image
        if (!displayImage) {
          displayImage = '/blog-images/post_28580_What_is_Nicotine_The_Ultimate_Guide.jpg';
          console.log('GuidesClient: Using fallback image for post', post.wp_id);
        }
        
        return (
          <Link
            key={post.id || post.wp_id || post.slug}
            href={`/${post.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article style={{
              backgroundColor: 'transparent',
              borderRadius: '0',
              overflow: 'visible',
              boxShadow: 'none',
              transition: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              border: 'none'
            }}>
              {/* Featured Image - Rounded Corners and Separate */}
              <div style={{
                width: '100%',
                height: '210px',
                overflow: 'hidden',
                borderRadius: '25px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Image 
                  src={displayImage}
                  alt={displayTitle}
                  width={300}
                  height={230}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              </div>
              
              {/* Content - No border, no shadow */}
              <div style={{ 
                padding: '0',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none'
              }}>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '500',
                  color: '#333',
                  margin: '0 0 12px 0',
                  lineHeight: '1.3',
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  {displayTitle}
                </h3>
                
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0',
                  flex: 1,
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }}>
                  {(() => {
                    const content = post.seo_meta?.description || post.excerpt || '';
                    const cleanedText = content.replace(/<[^>]*>/g, '').replace(/\[&hellip;\]/g, '...').replace(/&#8217;/g, "'").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                    return cleanedText.length > 360 ? cleanedText.substring(0, 360) + '...' : cleanedText;
                  })()}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#999',
                  marginTop: 'auto'
                }}>
                  <span>By {post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '60px',
          marginBottom: '40px'
        }}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: '2px solid #e5e7eb',
              backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#9ca3af' : '#666',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          
          <div style={{
            display: 'flex',
            gap: '5px'
          }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              return (
                <button 
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '25px',
                    border: isActive ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    backgroundColor: isActive ? '#2563eb' : '#ffffff',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    cursor: 'pointer',
                    color: isActive ? '#ffffff' : '#666',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span style={{ padding: '10px 5px', color: '#666' }}>...</span>
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '25px',
                    border: currentPage === totalPages ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    backgroundColor: currentPage === totalPages ? '#2563eb' : '#ffffff',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    cursor: 'pointer',
                    color: currentPage === totalPages ? '#ffffff' : '#666',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: '2px solid #e5e7eb',
              backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? '#9ca3af' : '#666',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Pagination Info */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        color: '#666',
        fontSize: '14px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of {totalPosts} guides
      </div>
    </>
  );
}

