import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase';

interface GuidesPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featured_image_local?: string;
  featured_image?: string;
  seo_meta?: {
    title?: string;
    description?: string;
    og_image?: string;
  } | null;
}

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
    .substring(0, 120) + '...';
};

// Server-side data fetch — called once at build/ISR time
async function getLatestGuides(): Promise<GuidesPost[]> {
  try {
    const client = supabaseAdmin();
    if (!client) return [];

    const { data, error } = await client
      .from('blog_posts')
      .select('slug, title, excerpt, date, featured_image, featured_image_local, seo_meta')
      .in('status', ['publish', 'published'])
      .order('date', { ascending: false })
      .limit(4);

    if (error || !data) return [];
    return data as GuidesPost[];
  } catch {
    return [];
  }
}

export default async function GuidesSection() {
  const posts = await getLatestGuides();

  if (posts.length === 0) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .guides-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 15px !important;
            padding: 0 15px !important;
          }
          .guides-container {
            padding: 40px 0 !important;
          }
          .guides-title {
            font-size: 1.8rem !important;
            margin-bottom: 20px !important;
          }
          .guides-subtitle {
            font-size: 1rem !important;
            margin-bottom: 30px !important;
          }
        }
        @media (max-width: 480px) {
          .guides-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}} />
      <div className="guides-container" style={{
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
          <h2 className="guides-title" style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: '0 0 15px 0',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            Latest Guides
          </h2>
          <p className="guides-subtitle" style={{
            fontSize: '1.125rem',
            color: '#666',
            margin: '0 0 30px 0',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
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
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            View All Guides
          </Link>
        </div>

        {/* Guides Grid */}
        <div className="guides-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {posts.map((post) => {
            const displayTitle = post.seo_meta?.title || post.title;
            const displayDescription = post.seo_meta?.description || cleanExcerpt(post.excerpt || '');

            const displayImage = post.featured_image_local ||
              (post.seo_meta?.og_image ?
                post.seo_meta.og_image.replace(/https:\/\/nicotine-pouches\.org\/wp-content\/uploads\/[^"'\s]+/, (match: string) => {
                  const filename = match.split('/').pop()?.split('?')[0] || '';
                  return `/blog-images/${filename}`;
                }) : null) || '/blog-images/post_28580_What_is_Nicotine_The_Ultimate_Guide.jpg';

            return (
              <Link
                key={post.slug}
                href={`/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article style={{
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}>
                  {/* Featured Image */}
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

                  {/* Content */}
                  <div>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 15px 0',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      lineHeight: '1.3'
                    }}>
                      {displayTitle}
                    </h3>

                    <p style={{
                      fontSize: '16px',
                      color: '#666',
                      margin: '0 0 20px 0',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
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
    </>
  );
}
