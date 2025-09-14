'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogSearch from '@/components/BlogSearch';
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

interface BlogPost {
  wp_id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  featured_image: string;
  featured_image_local?: string;
  seo_meta?: {
    title?: string;
    description?: string;
  };
}

export default function GuidesPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await loadBlogPosts();
      // Sort posts by date (newest first)
      const sortedPosts = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(sortedPosts);
      setFilteredPosts(sortedPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handleSearchResults = useCallback((results: BlogPost[]) => {
    setFilteredPosts(results);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  const featuredPost = filteredPosts[0]; // Latest post as featured
  const otherPosts = filteredPosts.slice(1);

  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '0'
          }}>
            <div style={{
              padding: '0 20px 0 76px', // 20px container padding + 50px marginLeft + 4px = 74px total
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Klarna Text, sans-serif',
              textAlign: 'left'
            }}>
              <a href="/" style={{ color: '#0B051D', textDecoration: 'none', fontFamily: 'Klarna Text, sans-serif', fontWeight: '800' }}>Start</a>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ fontFamily: 'Klarna Text, sans-serif' }}>Guides</span>
            </div>
          </div>

          {/* Featured Post Header - Two Column Layout */}
          {featuredPost && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '0',
              width: '100%',
              marginTop: '-20px'
            }}>
              <div style={{
                width: '100%',
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'center'
              }}>
                
                {/* Left Column - Title and Content */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  paddingTop: '0',
                  maxWidth: '700px',
                  marginLeft: '50px',
                  marginTop: '60px'
                }}>
                  <h1 style={{
                    fontSize: '80px',
                    fontWeight: '1000',
                    color: '#0B051D',
                    margin: '0 0 20px 0',
                    lineHeight: '0.9',
                    fontFamily: 'Klarna Text, sans-serif',
                    letterSpacing: '-0.05em'
                  }}>
                    {featuredPost.seo_meta?.title || featuredPost.title || 'Nicotine Pouches'}
                  </h1>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f3accc',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <span style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        K
                      </span>
                    </div>
                    <span style={{
                      color: '#666',
                      fontSize: '16px',
                      marginRight: '12px',
                      fontFamily: 'Klarna Text, sans-serif'
                    }}>
                      {featuredPost.author}
                    </span>
                    <span style={{
                      color: '#f3accc',
                      fontSize: '16px',
                      fontWeight: '500',
                      fontFamily: 'Klarna Text, sans-serif'
                    }}>
                      Guides
                    </span>
                  </div>

                  <p style={{
                    fontSize: '18px',
                    color: '#666',
                    lineHeight: '1.6',
                    marginBottom: '30px',
                    fontFamily: 'Klarna Text, sans-serif'
                  }}>
                    {featuredPost.seo_meta?.description || featuredPost.excerpt}
                  </p>

                  <Link href={`/${featuredPost.slug}`} style={{
                    display: 'inline-block',
                    backgroundColor: '#000',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '25px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Klarna Text, sans-serif'
                  }}>
                    Read more
                  </Link>
                </div>

                {/* Right Column - Image with Right Border Radius */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  borderRadius: '25px',
                  padding: '0',
                  height: '400px',
                  width: '90%',
                  overflow: 'hidden',
                  marginTop: '40px'
                }}>
                  <Image
                    src={featuredPost.featured_image_local || featuredPost.featured_image || '/placeholder-product.jpg'}
                    alt={featuredPost.title}
                    width={300}
                    height={400}
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      objectPosition: 'top',
                      borderRadius: '25px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Discover More Section */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            width: '100%'
          }}>
            <div style={{
              width: '100%',
              padding: '0 20px'
            }}>
              
              {/* Section Header with Search and Filters */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    margin: '0',
                    fontFamily: 'Klarna Text, sans-serif'
                  }}>
                    Discover more
                  </h2>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                  {/* Select Categories Filter */}
                  <select style={{
                    padding: '8px 16px',
                    border: '1px solid #e9ecef',
                    borderRadius: '20px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    color: '#495057',
                    cursor: 'pointer',
                    fontWeight: '500',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '32px'
                  }}>
                    <option value="">Select Categories</option>
                    <option value="guides">Guides</option>
                    <option value="reviews">Reviews</option>
                    <option value="comparisons">Comparisons</option>
                  </select>
                  
                  {/* Newest/Oldest Filter */}
                  <select style={{
                    padding: '8px 16px',
                    border: '1px solid #e9ecef',
                    borderRadius: '20px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    color: '#495057',
                    cursor: 'pointer',
                    fontWeight: '500',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '32px'
                  }}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  </div>
                </div>
                
                {/* Search Field */}
                <div style={{
                  maxWidth: '500px'
                }}>
                  <BlogSearch 
                    posts={posts} 
                    onSearchResults={handleSearchResults}
                  />
                </div>
              </div>

              {/* Posts Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '30px'
              }}>
                {otherPosts.map((post) => {
                  const displayTitle = post.seo_meta?.title || post.title;
                  const displayImage = post.featured_image_local || post.featured_image || '/placeholder-product.jpg';
                  
                  return (
                    <Link 
                      key={post.wp_id} 
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
                      }}
                      >
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
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
