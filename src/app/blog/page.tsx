import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSEOTags } from '@/lib/seo-core';
import { blogPosts, getAllCategories, getAllTags } from '@/lib/blog-content';

export const metadata: Metadata = getSEOTags('blog', {
  title: 'Nicotine Pouches Blog - Guides, Reviews & News',
  description: 'Stay updated with the latest nicotine pouches news, reviews, and guides. Expert insights on brands, flavors, and best practices.',
  canonical: 'https://nicotine-pouches.org/blog',
  keywords: 'nicotine pouches blog, news, reviews, guides, UK, ZYN, VELO, LOOP'
});

export default function BlogPage() {
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
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
          
          {/* Page Header */}
          <div className="page-header" style={{
            backgroundColor: '#f8f9fa',
            padding: '60px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 20px 0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                Nicotine Pouches Blog
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#666',
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Expert insights, reviews, and guides to help you make informed decisions about nicotine pouches.
                Stay updated with the latest news and trends in the UK market.
              </p>
            </div>
          </div>

          {/* Blog Content */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 20px'
          }}>
            
            {/* Categories Filter */}
            <div style={{
              marginBottom: '40px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '20px'
              }}>
                Browse by Category
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center'
              }}>
                {categories.map(category => (
                  <span
                    key={category}
                    style={{
                      backgroundColor: '#007cba',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px',
              marginBottom: '60px'
            }}>
              {blogPosts.map((post) => (
                <article
                  key={post.slug}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  className="hover:transform hover:scale-105 hover:shadow-lg"
                >
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {/* Featured Image */}
                    <div style={{
                      width: '100%',
                      height: '200px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        style={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        className="hover:scale-110"
                      />
                      {/* Category Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        backgroundColor: '#007cba',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {post.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '25px' }}>
                      <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#333',
                        margin: '0 0 15px 0',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.title}
                      </h2>
                      
                      <p style={{
                        fontSize: '1rem',
                        color: '#666',
                        lineHeight: '1.5',
                        margin: '0 0 20px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.description}
                      </p>

                      {/* Meta Information */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '15px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={32}
                            height={32}
                            style={{
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <span style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            fontWeight: '500'
                          }}>
                            {post.author.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#999'
                        }}>
                          {post.readTime} min read
                        </span>
                      </div>

                      {/* Date */}
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#999',
                        marginBottom: '15px'
                      }}>
                        {new Date(post.date).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      {/* Tags */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            style={{
                              backgroundColor: '#f1f3f4',
                              color: '#666',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span style={{
                            color: '#999',
                            fontSize: '0.75rem'
                          }}>
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '15px'
              }}>
                Stay Updated
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#666',
                marginBottom: '25px',
                maxWidth: '600px',
                margin: '0 auto 25px auto'
              }}>
                Get the latest nicotine pouches news, reviews, and exclusive deals delivered to your inbox.
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
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <button style={{
                  backgroundColor: '#007cba',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
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
  );
}
