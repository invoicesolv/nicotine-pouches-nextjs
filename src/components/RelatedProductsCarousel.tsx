'use client';

import Link from 'next/link';
import Image from 'next/image';

interface RelatedProduct {
  id: number;
  name: string;
  image_url: string;
  price: string;
  original_price?: string;
  store_count: number;
  tracking_count: number;
  slug: string;
}

function getLocalImagePath(imageUrl: string | undefined, productId: number, productName: string) {
  if (!imageUrl) return '/placeholder-product.svg';
  if (imageUrl.startsWith('/wordpress-images/') || imageUrl.startsWith('/uploads/')) {
    return imageUrl;
  }
  const safeName = productName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  return `/wordpress-images/product_${productId}_${safeName}.jpg`;
}

export default function RelatedProductsCarousel({ products, title }: { products: RelatedProduct[]; title: string }) {
  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '400',
        color: '#333',
        margin: '0 0 20px 0',
        letterSpacing: '-0.3px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        {title}
      </h2>

      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '8px',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        width: '100%',
        paddingBottom: '10px'
      }}>
        {products.map((product, index) => (
          <div
            key={`related-${product.id}-${index}`}
            style={{
              width: '160px',
              minWidth: '160px',
              flex: '0 0 160px'
            }}
          >
            <div style={{
              position: 'relative',
              background: 'transparent',
              borderRadius: '0',
              overflow: 'visible',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              boxShadow: 'none',
              width: '100%',
              cursor: 'pointer'
            }}>

              {/* Tracking Badge */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                background: '#e5ff7d',
                padding: '2px 6px',
                borderRadius: '100px',
                fontSize: '9px',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.9)',
                zIndex: 2,
                letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
                lineHeight: '1.4'
              }}>
                {product.tracking_count > 0 ? `${product.tracking_count} tracking` : 'Track price'}
              </div>

              <Link href={`/product/${product.slug}`} style={{
                position: 'relative',
                zIndex: 1,
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}>
                <div className="product-image-container" style={{
                  width: '100%',
                  paddingBottom: '100%',
                  position: 'relative',
                  marginBottom: '6px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#fefefe'
                }}>
                  <Image
                    src={getLocalImagePath(product.image_url, product.id, product.name)}
                    alt={product.name}
                    width={144}
                    height={144}
                    className="product-image-zoom"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '8px',
                      boxSizing: 'border-box',
                      transition: 'transform 0.5s ease-out'
                    }}
                  />
                </div>

                <div style={{
                  padding: '4px 2px',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Title + Rating Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '4px',
                    marginBottom: '4px'
                  }}>
                    <h3 style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1f2544',
                      margin: '0',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      letterSpacing: '-0.2px',
                      flex: '1',
                      minWidth: '0',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      {product.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      flexShrink: 0
                    }}>
                      <span style={{ color: '#1f2544', fontSize: '11px' }}>★</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#1f2544',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {(4.2 + (product.id % 8) * 0.1).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Prices Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px',
                    marginBottom: '2px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1f2544',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      {product.price}
                    </span>
                    {product.original_price && (
                      <span style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        textDecoration: 'line-through',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {product.original_price}
                      </span>
                    )}
                  </div>

                  {/* In Stock */}
                  <p style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    margin: '0 0 4px 0',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                  }}>
                    In stock at {product.store_count} {product.store_count === 1 ? 'vendor' : 'vendors'}
                  </p>

                  {/* Store Count Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 3px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '50px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#6b7280',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      {product.store_count}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      stores
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .product-image-zoom:hover {
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
}
