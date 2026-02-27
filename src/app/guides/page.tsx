import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GuidesGridWithSearch from '@/components/GuidesGridWithSearch';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

// Get total post count from DB (head-only, no data transferred)
const getTotalPostCount = async (searchQuery?: string): Promise<number> => {
  try {
    let query = supabase()
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    }

    const { count, error } = await query;
    if (error) {
      console.error('Error getting post count:', error);
      return 0;
    }
    return count || 0;
  } catch (error) {
    console.error('Error in getTotalPostCount:', error);
    return 0;
  }
};

// Load only the posts needed for the current page
const loadPaginatedPosts = async (
  page: number,
  perPage: number,
  sortOrder: string = 'newest',
  searchQuery?: string
): Promise<{ featured: BlogPost | null; posts: BlogPost[]; totalCount: number }> => {
  try {
    const ascending = sortOrder === 'oldest';

    // Get total count
    const totalCount = await getTotalPostCount(searchQuery);

    // Fetch featured post (first post by sort order)
    let featuredQuery = supabase()
      .from('blog_posts')
      .select('*')
      .order('date', { ascending })
      .limit(1);

    if (searchQuery) {
      featuredQuery = featuredQuery.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    }

    const { data: featuredData } = await featuredQuery;
    const featured = featuredData?.[0] || null;

    // Fetch paginated posts (offset by 1 to skip featured)
    const offset = (page - 1) * perPage + 1; // +1 to skip featured post
    let postsQuery = supabase()
      .from('blog_posts')
      .select('*')
      .order('date', { ascending })
      .range(offset, offset + perPage - 1);

    if (searchQuery) {
      postsQuery = postsQuery.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    }

    const { data: posts, error } = await postsQuery;

    if (error) {
      console.error('Error fetching paginated posts:', error);
      return { featured, posts: [], totalCount };
    }

    return { featured, posts: posts || [], totalCount };
  } catch (error) {
    console.error('Error in loadPaginatedPosts:', error);
    return { featured: null, posts: [], totalCount: 0 };
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

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function GuidesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const searchQuery = params.search || '';
  const sortOrder = params.sort || 'newest';
  const postsPerPage = 12;

  // Server-side pagination: only fetch the posts we need
  const { featured: featuredPost, posts: paginatedPosts, totalCount } = await loadPaginatedPosts(
    currentPage,
    postsPerPage,
    sortOrder,
    searchQuery || undefined
  );

  const totalPosts = Math.max(0, totalCount - 1); // -1 for featured post
  const totalPages = Math.ceil(totalPosts / postsPerPage);

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
            .discover-more-title {
              font-size: 1.8rem !important;
              margin: 0 !important;
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
                    {(() => {
                      const content = featuredPost.seo_meta?.description || featuredPost.excerpt || '';
                      return content.replace(/<[^>]*>/g, '').replace(/\[&hellip;\]/g, '...').replace(/&hellip;/g, '...').replace(/&#8217;/g, "'").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                    })()}
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
          <div id="posts-section" style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            width: '100%'
          }}>
            <div style={{
              width: '100%',
              padding: '0 20px'
            }}>
              
              {/* Posts Grid with Search, Sort & Pagination */}
              <GuidesGridWithSearch
                posts={paginatedPosts}
                totalPosts={totalPosts}
                totalPages={totalPages}
                currentPage={currentPage}
                searchQuery={searchQuery}
                sortOrder={sortOrder}
                isServerPaginated={true}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nicotine Pouches Guides - Complete Tutorials & How-To Guides',
    description: 'Comprehensive guides to help you understand nicotine pouches, their benefits, and how to use them effectively. Learn everything you need to know about nicotine pouches.',
    keywords: 'nicotine pouches guides, how to use nicotine pouches, nicotine pouches tutorial, nicotine pouches tips, nicotine pouches benefits',
    robots: 'index, follow',
    authors: [{ name: 'Nicotine Pouches Team' }],
    openGraph: {
      title: 'Nicotine Pouches Guides - Complete Tutorials & How-To Guides',
      description: 'Comprehensive guides to help you understand nicotine pouches, their benefits, and how to use them effectively.',
      url: 'https://nicotine-pouches.org/guides',
      siteName: 'Nicotine Pouches',
      images: [
        {
          url: '/guides-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Nicotine Pouches Guides',
        },
      ],
      locale: 'en-GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Nicotine Pouches Guides - Complete Tutorials & How-To Guides',
      description: 'Comprehensive guides to help you understand nicotine pouches, their benefits, and how to use them effectively.',
      images: ['/guides-og-image.jpg'],
      creator: '@nicotinepouches',
      site: '@nicotinepouches',
    },
    alternates: {
      canonical: 'https://nicotine-pouches.org/guides',
      languages: {
        'en-GB': 'https://nicotine-pouches.org/guides',
        'en-US': 'https://nicotine-pouches.org/us/guides',
        'x-default': 'https://nicotine-pouches.org/guides',
      },
    },
  };
}