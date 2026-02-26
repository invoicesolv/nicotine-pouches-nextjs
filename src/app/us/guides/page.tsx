import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRGuidesGrid from '@/components/SSRGuidesGrid';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { generateUSGuidesPageMeta, pageMetaToMetadata } from '@/lib/meta-generator';

const POSTS_PER_PAGE = 12;

type PaginationItem = number | 'ellipsis';

// Load extracted blog posts data - US posts only
const loadBlogPosts = async (): Promise<BlogPost[]> => {
  // Since there are no US posts yet, return empty array
  // This will show the "coming soon" message
  // When US posts are added to the database, implement filtering logic here
  return [];
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

type GuidesPageSearchParams = {
  page?: string;
};

export default async function USGuidesPage({
  searchParams,
}: {
  searchParams?: Promise<GuidesPageSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedPage = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const currentPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

  const posts = await loadBlogPosts();
  console.log('USGuidesPage: Loaded posts:', posts.length);
  
  // If no posts, show coming soon message
  const hasPosts = posts && posts.length > 0;
  
  // Sort posts by date (newest first)
  const sortedPosts = hasPosts ? posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const featuredPost = sortedPosts[0]; // Latest post as featured
  const remainingPosts = featuredPost ? sortedPosts.slice(1) : sortedPosts;
  const totalPages = Math.max(1, Math.ceil(remainingPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = remainingPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  const showPagination = totalPages > 1;
  const showingStart = remainingPosts.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + paginatedPosts.length, remainingPosts.length);
  const prevPage = safePage > 1 ? safePage - 1 : null;
  const nextPage = safePage < totalPages ? safePage + 1 : null;
  const paginationButtonStyle = {
    padding: '8px 16px',
    borderRadius: '9999px',
    border: '1px solid #e9ecef',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    color: '#0B051D',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px'
  };
  const disabledButtonStyle = {
    opacity: 0.4,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const
  };
  const activeButtonStyle = {
    backgroundColor: '#0B051D',
    color: '#fff',
    borderColor: '#0B051D'
  };

  const buildPageHref = (page: number) => (page <= 1 ? '/us/guides' : `/us/guides?page=${page}`);
  
  const paginationItems: PaginationItem[] = [];
  const windowSize = 2;
  const windowStart = Math.max(1, safePage - windowSize);
  const windowEnd = Math.min(totalPages, safePage + windowSize);

  if (windowStart > 1) {
    paginationItems.push(1);
    if (windowStart > 2) {
      paginationItems.push('ellipsis');
    }
  }

  for (let page = windowStart; page <= windowEnd; page++) {
    paginationItems.push(page);
  }

  if (windowEnd < totalPages) {
    if (windowEnd < totalPages - 1) {
      paginationItems.push('ellipsis');
    }
    paginationItems.push(totalPages);
  }
  
  console.log('USGuidesPage: Featured post:', featuredPost?.title);
  console.log('USGuidesPage: Paginated posts:', paginatedPosts.length, 'current page:', safePage, 'total pages:', totalPages);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .guides-page-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 15px !important;
              padding: 0 15px !important;
            }
            .guides-page-container {
              padding: 40px 0 !important;
            }
            .guides-page-title {
              font-size: 1.8rem !important;
              margin-bottom: 20px !important;
            }
            .guides-page-subtitle {
              font-size: 1rem !important;
              margin-bottom: 30px !important;
            }
            .featured-header-grid {
              grid-template-columns: 1fr !important;
              gap: 0 !important;
              padding: 0 15px !important;
            }
            .featured-title {
              font-size: 2.5rem !important;
              line-height: 1.2 !important;
              margin: 0 0 15px 0 !important;
            }
            .featured-image-container {
              width: 100% !important;
              height: 250px !important;
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              order: -1 !important;
            }
            .featured-header-grid {
              gap: 15px !important;
            }
            .featured-title {
              margin-top: 0 !important;
            }
            .featured-left-column {
              margin-top: 0 !important;
              margin-left: 0 !important;
            }
            .discover-more-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 20px !important;
            }
            .discover-more-title {
              font-size: 1.8rem !important;
              margin: 0 !important;
            }
            .filter-controls {
              width: 100% !important;
              flex-direction: row !important;
              gap: 15px !important;
              flex-wrap: wrap !important;
            }
            .breadcrumb {
              padding: 0 20px !important;
              margin-top: 20px !important;
              margin-bottom: 30px !important;
              display: block !important;
              visibility: visible !important;
              position: relative !important;
              z-index: 1 !important;
            }
            .pagination-container {
              flex-direction: column !important;
              gap: 20px !important;
            }
            .pagination-buttons {
              flex-wrap: wrap !important;
              justify-content: center !important;
              gap: 8px !important;
            }
            .pagination-button {
              padding: 6px 10px !important;
              font-size: 12px !important;
              min-width: 35px !important;
            }
          }
          @media (max-width: 480px) {
            .guides-page-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .featured-title {
              font-size: 2rem !important;
            }
          }
        `
      }} />
      <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{
            backgroundColor: '#ffffff',
            padding: '0'
          }}>
            <div style={{
              padding: '0 20px 0 70px', // 20px container padding + 50px marginLeft = 70px total
              fontSize: '14px',
              color: '#666',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              textAlign: 'left'
            }}>
              <Link href="/us" style={{ color: '#0B051D', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", fontWeight: '800' }}>Start</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>Guides</span>
            </div>
          </div>

          {/* Coming Soon Message if no posts */}
          {!hasPosts && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '80px 20px',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '1000',
                color: '#0B051D',
                margin: '0 0 20px 0',
                lineHeight: '1.2',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                letterSpacing: '-0.05em'
              }}>
                Guides Coming Soon
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '30px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                We're working on creating guides for US nicotine pouch users. Check back soon for helpful tutorials, tips, and information.
              </p>
            </div>
          )}

          {/* Featured Post Header - Two Column Layout */}
          {hasPosts && featuredPost && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '0',
              width: '100%',
              marginTop: '-20px'
            }}>
              <div className="featured-header-grid" style={{
                width: '100%',
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'center'
              }}>
                
                {/* Left Column - Title and Content */}
                <div className="featured-left-column" style={{
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
                  <h1 className="featured-title" style={{
                    fontSize: '80px',
                    fontWeight: '1000',
                    color: '#0B051D',
                    margin: '0 0 20px 0',
                    lineHeight: '0.9',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      {featuredPost.author}
                    </span>
                    <span style={{
                      color: '#f3accc',
                      fontSize: '16px',
                      fontWeight: '500',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      Guides
                    </span>
                  </div>

                  <p style={{
                    fontSize: '18px',
                    color: '#666',
                    lineHeight: '1.6',
                    marginBottom: '30px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    {(() => {
                      const content = featuredPost.seo_meta?.description || featuredPost.excerpt || '';
                      return content.replace(/<[^>]*>/g, '').replace(/\[&hellip;\]/g, '...').replace(/&hellip;/g, '...').replace(/&#8217;/g, "'").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                    })()}
                  </p>

                  <Link href={`/us/guides/${featuredPost.slug}`} style={{
                    display: 'inline-block',
                    backgroundColor: '#000',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '25px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Read more
                  </Link>
                </div>

                {/* Right Column - Image with Right Border Radius */}
                <div className="featured-image-container" style={{
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
          {hasPosts && (
            <div id="posts-section" style={{
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
                  <div className="discover-more-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
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
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
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
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
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
                </div>

                {/* Posts Grid - Server Component */}
                <SSRGuidesGrid posts={paginatedPosts} />

                {showPagination && (
                  <div className="pagination-container" style={{
                    marginTop: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    textAlign: 'center'
                  }}>
                    <div className="pagination-info" style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      Showing {showingStart}-{showingEnd} of {remainingPosts.length} guides
                    </div>
                    <div className="pagination-buttons" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {prevPage ? (
                        <Link
                          href={buildPageHref(prevPage)}
                          className="pagination-button"
                          style={paginationButtonStyle}
                        >
                          Previous
                        </Link>
                      ) : (
                        <span
                          className="pagination-button"
                          style={{ ...paginationButtonStyle, ...disabledButtonStyle }}
                        >
                          Previous
                        </span>
                      )}

                      {paginationItems.map((item, index) => {
                        if (item === 'ellipsis') {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              style={{ ...paginationButtonStyle, border: 'none', cursor: 'default' }}
                            >
                              &hellip;
                            </span>
                          );
                        }

                        const isActive = item === safePage;
                        return (
                          <Link
                            key={`page-${item}`}
                            href={buildPageHref(item)}
                            className="pagination-button"
                            aria-current={isActive ? 'page' : undefined}
                            style={{
                              ...paginationButtonStyle,
                              ...(isActive ? activeButtonStyle : {})
                            }}
                          >
                            {item}
                          </Link>
                        );
                      })}

                      {nextPage ? (
                        <Link
                          href={buildPageHref(nextPage)}
                          className="pagination-button"
                          style={paginationButtonStyle}
                        >
                          Next
                        </Link>
                      ) : (
                        <span
                          className="pagination-button"
                          style={{ ...paginationButtonStyle, ...disabledButtonStyle }}
                        >
                          Next
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <Footer isUSRoute={true} />
      </div>
    </div>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetaToMetadata(generateUSGuidesPageMeta());
}

