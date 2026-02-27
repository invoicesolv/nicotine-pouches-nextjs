import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GuidesGridWithSearch from '@/components/GuidesGridWithSearch';
import { supabaseAdmin } from '@/lib/supabase';
import { Metadata } from 'next';
import { generateGuidesPageMeta, pageMetaToMetadata } from '@/lib/meta-generator';

// Enable ISR with 1 hour cache for better performance
export const revalidate = 3600;

const POSTS_PER_PAGE = 12;

// Raw row shape from blog_posts select
interface BlogPostRow {
  id?: number;
  wp_id?: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  featured_image?: string;
  featured_image_local?: string;
  seo_meta?: { title?: string; description?: string } | null;
}

// Build minimal post object from DB row (avoid passing full seo_meta to prevent serialization issues)
function mapPostRow(post: BlogPostRow): BlogPost {
  const excerptText = post.excerpt?.replace(/<[^>]*>/g, '').replace(/[#*_]/g, '').trim().slice(0, 300) || '';
  const rawSeo = post.seo_meta && typeof post.seo_meta === 'object' ? post.seo_meta : null;
  return {
    id: post.id,
    wp_id: post.wp_id,
    title: post.title,
    slug: post.slug,
    excerpt: excerptText,
    date: post.date || post.created_at,
    author: 'Nicotine Pouches Team',
    featured_image: post.featured_image,
    featured_image_local: post.featured_image_local || post.featured_image,
    status: 'published',
    type: 'post',
    source: 'blog_posts',
    seo_meta: {
      title: typeof rawSeo?.title === 'string' ? rawSeo.title : post.title,
      description: typeof rawSeo?.description === 'string' ? rawSeo.description : excerptText
    }
  };
}

// Fetch one page of posts from DB + total count (no over-fetching)
const getPaginatedPosts = async (page: number, search?: string) => {
  const client = supabaseAdmin();
  if (!client) {
    console.error('[Guides Page] Supabase admin client not available');
    return { posts: [], featuredPost: null, totalPosts: 0, totalPages: 1, currentPage: page };
  }

  const searchTerm = search?.trim();
  const baseQuery = client
    .from('blog_posts')
    .select('id, wp_id, title, slug, excerpt, date, created_at, updated_at, featured_image, featured_image_local, seo_meta', { count: 'exact' })
    .in('status', ['publish', 'published'])
    .order('date', { ascending: false });

  // Optional search filter (title or excerpt)
  const query = searchTerm
    ? baseQuery.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
    : baseQuery;

  // Page 1: featured (1) + grid (12) = 13 rows; other pages: 12 rows
  const pageSize = page === 1 ? POSTS_PER_PAGE + 1 : POSTS_PER_PAGE;
  const rangeStart = page === 1 ? 0 : (page - 1) * POSTS_PER_PAGE;
  const rangeEnd = rangeStart + pageSize - 1;

  const { data: rows, error, count } = await query.range(rangeStart, rangeEnd);

  if (error) {
    console.error('[Guides Page] Error fetching from blog_posts:', error?.message ?? error?.code ?? JSON.stringify(error));
    return { posts: [], featuredPost: null, totalPosts: 0, totalPages: 1, currentPage: page };
  }

  const totalPosts = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const mapped = (rows || []).map(mapPostRow);

  const featuredPost = page === 1 && mapped.length > 0 ? mapped[0] : null;
  const postsToShow = page === 1 && mapped.length > 1 ? mapped.slice(1, POSTS_PER_PAGE + 1) : mapped;

  console.log(`[Guides Page] Fetched ${mapped.length} posts for page ${page}/${totalPages} (total ${totalPosts})`);
  return {
    posts: postsToShow,
    featuredPost,
    totalPosts,
    totalPages,
    currentPage: page
  };
};

interface BlogPost {
  id?: number;
  wp_id?: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  featured_image?: string;
  featured_image_local?: string;
  seo_meta?: {
    title?: string;
    description?: string;
  };
  status?: string;
  type?: string;
  source?: string;
}

interface GuidesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const searchQuery = resolvedParams.search || '';

  let paginatedPosts: BlogPost[] = [];
  let featuredPost: BlogPost | null = null;
  let totalPosts = 0;
  let totalPages = 1;

  try {
    const result = await getPaginatedPosts(currentPage, searchQuery);
    paginatedPosts = Array.isArray(result.posts) ? result.posts : [];
    featuredPost = result.featuredPost ?? null;
    totalPosts = typeof result.totalPosts === 'number' ? result.totalPosts : 0;
    totalPages = Math.max(1, typeof result.totalPages === 'number' ? result.totalPages : 1);
  } catch (err) {
    console.error('[Guides Page] Error loading posts:', err);
  }

  console.log(`[Guides Page] Page ${currentPage}/${totalPages}, showing ${paginatedPosts.length} posts`);

  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{
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
      <div id="wrapper" className="fusion-wrapper" suppressHydrationWarning>
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
              <Link href="/" style={{ color: '#0B051D', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", fontWeight: '800' }}>Start</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>Guides</span>
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
          <div id="posts-section" style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            width: '100%'
          }}>
            <div style={{
              width: '100%',
              padding: '0 20px'
            }}>
              {/* Posts Grid with Server-Side Pagination */}
              <GuidesGridWithSearch
                posts={paginatedPosts}
                totalPosts={totalPosts}
                totalPages={totalPages}
                currentPage={currentPage}
                searchQuery={searchQuery}
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
  return pageMetaToMetadata(generateGuidesPageMeta());
}