import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogContentProcessor from '@/components/BlogContentProcessor';
import { getSEOTags, renderSchemaTag, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getBlogSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getFullUrl } from '@/config/seo-config';
import { getBlogPostBySlug, getRecentBlogPosts } from '@/lib/blog-content';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  const seoData = getBlogSEOTemplate(post);
  seoData.keywords = post.keywords?.join(', ');
  seoData.dateModified = post.dateModified || post.date;
  seoData.itemReviewed = post.itemReviewed;
  seoData.rating = post.rating;
  seoData.speakableSections = post.speakableSections;

  return getSEOTags('blog', seoData);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const recentPosts = getRecentBlogPosts(4);
  const breadcrumbs = generateBreadcrumbData('blog', post);

  return (
    <>
      {renderSchemaTag('article', {
        title: post.title,
        description: post.description,
        image: post.image,
        author: post.author,
        datePublished: post.date,
        dateModified: post.dateModified || post.date,
        url: getFullUrl(`/blog/${post.slug}`),
        keywords: post.keywords,
        speakableSections: post.speakableSections,
        itemReviewed: post.itemReviewed,
        rating: post.rating
      })}
      {generateBreadcrumbSchema(breadcrumbs)}

      <style dangerouslySetInnerHTML={{
        __html: `
          .blog-content-container {
            width: calc(100% - 80px);
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
          }
          @media (max-width: 768px) {
            .blog-content-container {
              width: 100%;
              padding: 0 16px;
            }
            .blog-hero-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .blog-featured-image {
              max-width: 100% !important;
            }
            .blog-title {
              font-size: 1.75rem !important;
            }
            .blog-meta-row {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
            .related-products-grid {
              gap: 12px !important;
            }
            .related-articles-grid {
              grid-template-columns: 1fr !important;
            }
          }
          .article-content h2 {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            color: #0B051D;
            margin: 2.5rem 0 1rem 0;
            line-height: 1.3;
          }
          .article-content h3 {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 1.35rem;
            font-weight: 600;
            color: #1f2937;
            margin: 2rem 0 0.75rem 0;
            line-height: 1.4;
          }
          .article-content p {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 1.1rem;
            line-height: 1.8;
            color: #374151;
            margin-bottom: 1.25rem;
          }
          .article-content ul, .article-content ol {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 1.1rem;
            line-height: 1.8;
            color: #374151;
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
          }
          .article-content li {
            margin-bottom: 0.5rem;
          }
          .article-content a {
            color: #4F46E5;
            text-decoration: none;
            font-weight: 500;
          }
          .article-content a:hover {
            text-decoration: underline;
          }
          .article-content blockquote {
            border-left: 4px solid #4F46E5;
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
            background: #f8fafc;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #4b5563;
          }
          .article-content img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 1.5rem 0;
          }
          .product-card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          }
          .article-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          }
        `
      }} />

      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          <Header />

          <main id="main" className="clearfix" style={{
            backgroundColor: '#ffffff',
            minHeight: '100vh',
            padding: '0',
            margin: '0',
            width: '100%'
          }}>

            {/* Breadcrumb - Modern Style */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '0'
            }}>
              <div className="blog-content-container" style={{
                padding: '16px 0',
                fontSize: '15px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                <Link href="/" style={{
                  color: '#1f2937',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>Home</Link>
                <span style={{ margin: '0 12px', color: '#9ca3af' }}>/</span>
                <Link href="/blog" style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '400'
                }}>Blog</Link>
                <span style={{ margin: '0 12px', color: '#9ca3af' }}>/</span>
                <span style={{ color: '#6b7280', fontWeight: '400' }}>{post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}</span>
              </div>
            </div>

            {/* Article Hero Section */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '24px 0 40px 0'
            }}>
              <div className="blog-content-container">
                <div className="blog-hero-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '380px 1fr',
                  gap: '48px',
                  alignItems: 'start'
                }}>
                  {/* Featured Image */}
                  <div className="blog-featured-image" style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc'
                  }}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={380}
                      height={280}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: '16px'
                      }}
                    />
                  </div>

                  {/* Article Info */}
                  <div>
                    {/* Category Badge */}
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: '#EEF2FF',
                      color: '#4F46E5',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '16px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      {post.category}
                    </div>

                    {/* Title */}
                    <h1 className="blog-title" style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: '#0B051D',
                      margin: '0 0 16px 0',
                      lineHeight: '1.2',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      letterSpacing: '-0.02em'
                    }}>
                      {post.title}
                    </h1>

                    {/* Description */}
                    <p style={{
                      fontSize: '17px',
                      color: '#4b5563',
                      lineHeight: '1.7',
                      marginBottom: '24px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      {post.description}
                    </p>

                    {/* Meta Row */}
                    <div className="blog-meta-row" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Author */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          width={44}
                          height={44}
                          style={{
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #f3f4f6'
                          }}
                        />
                        <div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1f2937',
                            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                          }}>
                            {post.author.name}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                          }}>
                            {new Date(post.date).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{
                        width: '1px',
                        height: '32px',
                        backgroundColor: '#e5e7eb'
                      }} />

                      {/* Read Time */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        {post.readTime} min read
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '0 0 60px 0'
            }}>
              <div className="blog-content-container" style={{
                maxWidth: '800px'
              }}>
                {/* Summary Box */}
                <div className="summary speakable" style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#374151',
                  marginBottom: '40px',
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  borderLeft: '4px solid #4F46E5',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  <strong style={{ color: '#1f2937' }}>Summary:</strong> {post.description}
                </div>

                {/* Main Content - Using BlogContentProcessor for Related Products */}
                <BlogContentProcessor
                  content={post.content}
                  title={post.title}
                  post={post}
                />

                {/* Tags */}
                <div style={{
                  marginTop: '48px',
                  paddingTop: '32px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Tags
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    {post.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          padding: '8px 16px',
                          borderRadius: '100px',
                          fontSize: '14px',
                          fontWeight: '500',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                        }}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {recentPosts.length > 0 && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '64px 0'
              }}>
                <div className="blog-content-container">
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: '#0B051D',
                    marginBottom: '32px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Related Articles
                  </h2>

                  <div className="related-articles-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px'
                  }}>
                    {recentPosts.filter(p => p.slug !== post.slug).slice(0, 3).map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <article
                          className="article-card-hover"
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            height: '180px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              fill
                              style={{
                                objectFit: 'cover'
                              }}
                            />
                          </div>

                          <div style={{
                            padding: '24px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            {/* Category */}
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#4F46E5',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '8px',
                              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                            }}>
                              {relatedPost.category}
                            </span>

                            <h3 style={{
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: '#0B051D',
                              margin: '0 0 12px 0',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                            }}>
                              {relatedPost.title}
                            </h3>

                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              lineHeight: '1.6',
                              margin: '0 0 16px 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              flex: 1,
                              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                            }}>
                              {relatedPost.description}
                            </p>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                              color: '#9ca3af',
                              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                              {relatedPost.readTime} min read
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Newsletter CTA - Modern Style */}
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              padding: '72px 0',
              textAlign: 'center'
            }}>
              <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '0 20px'
              }}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  Stay Updated
                </h3>
                <p style={{
                  fontSize: '1.1rem',
                  marginBottom: '32px',
                  opacity: 0.9,
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  Get the latest reviews, price alerts, and exclusive deals delivered to your inbox.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  maxWidth: '440px',
                  margin: '0 auto'
                }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      outline: 'none'
                    }}
                  />
                  <button style={{
                    backgroundColor: '#0B051D',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, opacity 0.2s ease',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
