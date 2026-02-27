import Link from 'next/link';
import Image from 'next/image';

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

interface SSRGuidesGridProps {
  posts: BlogPost[];
}

export default function SSRGuidesGrid({ posts }: SSRGuidesGridProps) {
  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const paginatedPosts = sortedPosts.slice(0, 12); // Get first 12 posts

  return (
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
        }
        
        // Fallback to default image
        if (!displayImage) {
          displayImage = '/blog-images/post_28580_What_is_Nicotine_The_Ultimate_Guide.jpg';
        }
        
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
                    const cleanedText = content.replace(/<[^>]*>/g, '').replace(/\[&hellip;\]/g, '...').replace(/&hellip;/g, '...').replace(/&#8217;/g, "'").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
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
  );
}
