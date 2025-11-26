import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  // Add all new fields
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

  const recentPosts = getRecentBlogPosts(3);
  const breadcrumbs = generateBreadcrumbData('blog', post);

  return (
    <>
      {/* Enhanced Article Schema with all properties */}
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
            
            {/* Breadcrumb */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
                fontSize: '14px',
                color: '#666'
              }}>
                <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <Link href="/blog" style={{ color: '#666', textDecoration: 'none' }}>Blog</Link>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: '#333' }}>{post.title}</span>
              </div>
            </div>

            {/* Article Header */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '60px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '0 20px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#007cba',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '20px'
                }}>
                  {post.category}
                </div>
                
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 20px 0',
                  lineHeight: '1.2',
                  fontFamily: 'Klarna Text, sans-serif'
                }}>
                  {post.title}
                </h1>
                
                <p style={{
                  fontSize: '1.2rem',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                  {post.description}
                </p>

                {/* Author and Meta Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {post.author.name}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666'
                      }}>
                        {new Date(post.date).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '20px'
                  }}>
                    {post.readTime} min read
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '40px 20px'
            }}>
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={400}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>

            {/* Article Content */}
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 20px 60px 20px'
            }}>
              <div className="article-content">
                <div className="summary speakable" style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  color: '#333',
                  marginBottom: '30px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: '4px solid #007cba'
                }}>
                  {post.description}
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    color: '#333'
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </div>

            {/* Tags */}
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 20px 40px 20px',
              borderTop: '1px solid #e9ecef',
              paddingTop: '40px'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '15px'
              }}>
                Tags
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: '#f1f3f4',
                      color: '#666',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    className="hover:bg-gray-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Posts */}
            {recentPosts.length > 0 && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '60px 0'
              }}>
                <div style={{
                  maxWidth: '1200px',
                  margin: '0 auto',
                  padding: '0 20px'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: '40px',
                    textAlign: 'center'
                  }}>
                    Related Articles
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
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
                        <article style={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          overflow: 'hidden',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          cursor: 'pointer'
                        }}
                        className="hover:transform hover:scale-105 hover:shadow-lg">
                          <div style={{
                            width: '100%',
                            height: '150px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              fill
                              style={{
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                              className="hover:scale-110"
                            />
                          </div>
                          
                          <div style={{ padding: '20px' }}>
                            <h4 style={{
                              fontSize: '1.2rem',
                              fontWeight: '600',
                              color: '#333',
                              margin: '0 0 10px 0',
                              lineHeight: '1.3',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {relatedPost.title}
                            </h4>
                            
                            <p style={{
                              fontSize: '0.9rem',
                              color: '#666',
                              lineHeight: '1.5',
                              margin: '0 0 15px 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {relatedPost.description}
                            </p>
                            
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#999'
                            }}>
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

            {/* Newsletter CTA */}
            <div style={{
              backgroundColor: '#007cba',
              color: 'white',
              padding: '60px 0',
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
                  marginBottom: '15px'
                }}>
                  Enjoyed This Article?
                </h3>
                <p style={{
                  fontSize: '1.1rem',
                  marginBottom: '30px',
                  opacity: 0.9
                }}>
                  Subscribe to our newsletter for more expert insights, reviews, and exclusive deals.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  <button style={{
                    backgroundColor: 'white',
                    color: '#007cba',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease'
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
