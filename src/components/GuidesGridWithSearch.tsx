'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface BlogPost {
  id?: number | string;
  wp_id?: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  featured_image?: string;
  featured_image_local?: string;
  featured_media?: number;
  source?: string;
  seo_meta?: {
    title?: string;
    description?: string;
  };
}

interface GuidesGridWithSearchProps {
  posts: BlogPost[];
  totalPosts?: number;
  totalPages?: number;
  currentPage?: number;
  searchQuery?: string;
  isServerPaginated?: boolean;
}

export default function GuidesGridWithSearch({
  posts,
  totalPosts: serverTotalPosts,
  totalPages: serverTotalPages,
  currentPage: serverCurrentPage = 1,
  searchQuery: serverSearchQuery = '',
  isServerPaginated = false
}: GuidesGridWithSearchProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(serverSearchQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Safe navigation (guard against undefined router during SSR/hydration)
  const safePush = (url: string) => {
    if (typeof window === 'undefined') return;
    if (router?.push && typeof router.push === 'function') {
      router.push(url);
    } else {
      window.location.href = url;
    }
  };

  // Use server values for pagination
  const totalPosts = serverTotalPosts ?? posts.length;
  const totalPages = serverTotalPages ?? Math.ceil(posts.length / 12);
  const currentPage = serverCurrentPage;
  const postsPerPage = 12;

  // Calculate display indices for info text
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, totalPosts);

  // Handle search
  const handleSearch = useCallback(() => {
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    }
    params.set('page', '1');
    safePush(`/guides?${params.toString()}`);
  }, [searchInput]);

  // Build pagination URL for crawlable <Link> tags
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (serverSearchQuery) {
      params.set('search', serverSearchQuery);
    }
    params.set('page', page.toString());
    return `/guides?${params.toString()}`;
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    safePush('/guides');
  };

  return (
    <>
      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="discover-more-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h2 className="discover-more-title" style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            margin: '0',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            Discover more
          </h2>

          <div className="filter-controls" style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search guides..."
                style={{
                  padding: '8px 40px 8px 16px',
                  border: '1px solid #e9ecef',
                  borderRadius: '20px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#495057',
                  fontWeight: '500',
                  minWidth: '200px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <svg
                  style={{ color: '#6b7280' }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {serverSearchQuery && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              Found {totalPosts} {totalPosts === 1 ? 'guide' : 'guides'} for "{serverSearchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              style={{
                background: 'none',
                border: '1px solid #e9ecef',
                borderRadius: '15px',
                padding: '4px 12px',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="guides-page-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '30px'
      }}>
        {(Array.isArray(posts) ? posts : []).map((post, index) => {
          const displayTitle = post?.seo_meta?.title || post?.title || 'Guide';
          let displayImage = post?.featured_image_local || post?.featured_image;

          if (!displayImage && post?.wp_id && post?.featured_media && post.featured_media > 0) {
            const imageName = `post_${post.wp_id}_${(post.title || '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`;
            displayImage = `/blog-images/${imageName}.jpg`;
          }

          if (!displayImage) {
            displayImage = '/blog-images/post_28580_What_is_Nicotine_The_Ultimate_Guide.jpg';
          }

          // Canonical URL: root /{slug}
          const postUrl = `/${post.slug}`;

          return (
            <Link
              key={post.id ?? post.wp_id ?? post.slug ?? index}
              href={postUrl}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article style={{
                backgroundColor: 'transparent',
                borderRadius: '0',
                overflow: 'visible',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  width: '100%',
                  height: '210px',
                  overflow: 'hidden',
                  borderRadius: '25px',
                  marginBottom: '15px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Image
                    src={displayImage}
                    alt={displayTitle}
                    width={300}
                    height={210}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                <div style={{ padding: '0' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {displayTitle}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      {(() => {
                        try {
                          const date = new Date(post.date);
                          if (isNaN(date.getTime())) return 'Recent';
                          return date.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          });
                        } catch {
                          return 'Recent';
                        }
                      })()}
                    </span>
                    <span style={{ color: '#ccc' }}>•</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#f3accc',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      Guides
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* No results message */}
      {(Array.isArray(posts) ? posts : []).length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No guides found</p>
          <p style={{ fontSize: '14px' }}>Try a different search term</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '60px',
          marginBottom: '40px'
        }}>
          {currentPage > 1 ? (
            <Link
              href={getPaginationUrl(currentPage - 1)}
              className="pagination-button"
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                cursor: 'pointer',
                color: '#666',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              Previous
            </Link>
          ) : (
            <span
              className="pagination-button"
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                cursor: 'not-allowed',
                color: '#9ca3af',
                opacity: 0.5,
                fontWeight: '500'
              }}
            >
              Previous
            </span>
          )}

          <div className="pagination-buttons" style={{
            display: 'flex',
            gap: '5px'
          }}>
            {/* First page */}
            {currentPage > 3 && (
              <>
                <Link
                  href={getPaginationUrl(1)}
                  className="pagination-button"
                  style={{
                    padding: '10px 15px',
                    borderRadius: '25px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    cursor: 'pointer',
                    color: '#666',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                >
                  1
                </Link>
                {currentPage > 4 && (
                  <span style={{ padding: '10px 5px', color: '#666' }}>...</span>
                )}
              </>
            )}

            {/* Page numbers around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 2)
              .map(page => {
                const isActive = page === currentPage;
                return isActive ? (
                  <span
                    key={page}
                    className="pagination-button"
                    aria-current="page"
                    style={{
                      padding: '10px 15px',
                      borderRadius: '25px',
                      border: '2px solid #0B051D',
                      backgroundColor: '#0B051D',
                      fontSize: '14px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      color: '#ffffff',
                      fontWeight: '500'
                    }}
                  >
                    {page}
                  </span>
                ) : (
                  <Link
                    key={page}
                    href={getPaginationUrl(page)}
                    className="pagination-button"
                    style={{
                      padding: '10px 15px',
                      borderRadius: '25px',
                      border: '2px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      cursor: 'pointer',
                      color: '#666',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                  >
                    {page}
                  </Link>
                );
              })}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span style={{ padding: '10px 5px', color: '#666' }}>...</span>
                )}
                <Link
                  href={getPaginationUrl(totalPages)}
                  className="pagination-button"
                  style={{
                    padding: '10px 15px',
                    borderRadius: '25px',
                    border: '2px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    cursor: 'pointer',
                    color: '#666',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                >
                  {totalPages}
                </Link>
              </>
            )}
          </div>

          {currentPage < totalPages ? (
            <Link
              href={getPaginationUrl(currentPage + 1)}
              className="pagination-button"
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                cursor: 'pointer',
                color: '#666',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              Next
            </Link>
          ) : (
            <span
              className="pagination-button"
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                cursor: 'not-allowed',
                color: '#9ca3af',
                opacity: 0.5,
                fontWeight: '500'
              }}
            >
              Next
            </span>
          )}
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: '#666',
          fontSize: '14px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>
          Showing {startIndex + 1}-{endIndex} of {totalPosts} guides
        </div>
      )}
    </>
  );
}
