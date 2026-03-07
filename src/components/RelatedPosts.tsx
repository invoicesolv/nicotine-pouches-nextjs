import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase';

interface BlogPost {
  wp_id?: number;
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  featured_image?: string;
  featured_image_local?: string;
  seo_meta?: {
    title?: string;
    description?: string;
  } | null;
}

interface RelatedPostsProps {
  currentPostSlug: string;
  currentPostTitle: string;
  limit?: number;
}

// Helper function to find related posts based on title keywords
function findRelatedPosts(posts: BlogPost[], currentTitle: string, limit: number): BlogPost[] {
  const currentKeywords = currentTitle
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const scoredPosts = posts.map(post => {
    const postTitle = (post.seo_meta?.title || post.title).toLowerCase();
    const postExcerpt = (post.seo_meta?.description || post.excerpt || '').toLowerCase();
    const postContent = postTitle + ' ' + postExcerpt;

    let score = 0;

    currentKeywords.forEach(keyword => {
      if (postTitle.includes(keyword)) score += 3;
      if (postContent.includes(keyword)) score += 1;
    });

    const nicotineTerms = ['nicotine', 'pouch', 'pouches', 'zyn', 'snus', 'tobacco', 'smoking', 'quit', 'health', 'safety'];
    nicotineTerms.forEach(term => {
      if (postContent.includes(term)) score += 0.5;
    });

    return { post, score };
  });

  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

// Clean excerpt text
function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\[&hellip;\]/g, '...')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ');
}

export default async function RelatedPosts({
  currentPostSlug,
  currentPostTitle,
  limit = 3
}: RelatedPostsProps) {
  // Server-side fetch — HTML rendered with actual links for Googlebot
  let relatedPosts: BlogPost[] = [];

  try {
    const client = supabaseAdmin();
    if (client) {
      const { data, error } = await client
        .from('blog_posts')
        .select('id, wp_id, title, slug, excerpt, date, featured_image, featured_image_local, seo_meta')
        .in('status', ['publish', 'published'])
        .neq('slug', currentPostSlug)
        .order('date', { ascending: false })
        .limit(20);

      if (!error && data) {
        relatedPosts = findRelatedPosts(data as BlogPost[], currentPostTitle, limit);
      }
    }
  } catch {
    // Non-critical — fail silently
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .related-posts-full-width {
            position: relative;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
            width: 100vw;
            max-width: 100vw;
          }
          @media (max-width: 1024px) {
            .related-posts-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
          }
          @media (max-width: 768px) {
            .related-posts-grid {
              grid-template-columns: 1fr !important;
              gap: 15px !important;
            }
            .related-posts-container {
              padding: 30px 15px !important;
              margin: 40px 0 !important;
            }
            .related-posts-title {
              font-size: 1.5rem !important;
              margin-bottom: 20px !important;
            }
          }
          @media (max-width: 480px) {
            .related-posts-container {
              padding: 20px 10px !important;
              margin: 30px 0 !important;
            }
            .related-posts-title {
              font-size: 1.3rem !important;
            }
          }
        `
      }} />
      <div className="related-posts-full-width">
        <div className="related-posts-container" style={{
          width: '100%',
          marginTop: '60px',
          padding: '40px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          boxSizing: 'border-box',
          maxWidth: '1200px',
          margin: '60px auto 0 auto'
        }}>
          <h3 className="related-posts-title" style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: '0 0 30px 0',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            textAlign: 'center'
          }}>
            Related Articles
          </h3>

          <div className="related-posts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {relatedPosts.map((post) => {
              const displayTitle = post.seo_meta?.title || post.title;
              const displayDescription = post.seo_meta?.description || post.excerpt || '';
              const displayImage = post.featured_image_local || post.featured_image || '/placeholder-product.jpg';
              const cleanedDesc = cleanText(displayDescription);

              return (
                <Link
                  key={post.id || post.wp_id || post.slug}
                  href={`/${post.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article style={{
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Featured Image */}
                    <div style={{
                      width: '100%',
                      height: '210px',
                      overflow: 'hidden',
                      borderRadius: '25px',
                      marginBottom: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      maxWidth: '100%'
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
                          borderRadius: '12px',
                          maxWidth: '100%'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{
                      padding: '0',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <h4 style={{
                        fontSize: '26px',
                        fontWeight: '500',
                        color: '#333',
                        margin: '0 0 12px 0',
                        lineHeight: '1.3',
                        width: '100%',
                        maxWidth: '100%',
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {displayTitle}
                      </h4>

                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.5',
                        margin: '0 0 16px 0',
                        flex: 1,
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                        width: '100%',
                        maxWidth: '100%',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {cleanedDesc.length > 360 ? cleanedDesc.substring(0, 360) + '...' : cleanedDesc}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#999',
                        marginTop: 'auto',
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                        width: '100%',
                        maxWidth: '100%',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <span>By Nicotine Pouches</span>
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
    </>
  );
}
