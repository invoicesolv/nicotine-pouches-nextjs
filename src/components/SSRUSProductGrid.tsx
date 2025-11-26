import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ProductButtonScript from './ProductButtonScript';
import ClientPriceAlertModal from './ClientPriceAlertModal';

interface Product {
  id: number;
  name: string;
  brand: string;
  flavour: string;
  strength: string;
  format: string;
  image: string;
  price: string;
  stores: number;
  watching: number;
  link: string;
}

interface SSRUSProductGridProps {
  brandFilter?: string;
}

const SSRUSProductGrid = async ({ brandFilter }: SSRUSProductGridProps) => {
  // Fetch products on the server
  let products: Product[] = [];

  try {
    let data: any[] = [];

    // Get US products
    let query = supabase().from('us_products').select('*');
    
    // Apply brand filter if provided
    if (brandFilter) {
      query = query.ilike('product_title', `${brandFilter}%`);
    }
    
    const { data: productData, error } = await query;
    
    if (error) {
      throw error;
    }
    
    data = productData || [];

    // Function to generate watching count between 400-800, round up to nearest hundred
    const generateWatchingCount = (min: number = 400, max: number = 800) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      const rounded = Math.ceil(count / 100) * 100;
      return rounded;
    };

    // Transform data to match expected format
    products = data.map((product: any) => {
      const brand = product.brand || product.product_title?.split(' ')[0] || 'Unknown';
      const flavour = product.flavour || product.product_title?.split(' ').slice(1).join(' ') || 'Unknown';
      const strength = product.strength || 'Normal';
      const format = product.format || 'Slim';
      
      // Generate proper slug from product title
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };
      
      const slug = generateSlug(product.product_title || 'unknown-product');
      
      return {
        id: product.id,
        name: product.product_title || 'Unknown Product',
        brand: brand,
        flavour: flavour,
        strength: strength,
        format: format,
        image: product.image_url || '/placeholder-product.jpg',
        price: product.price || 'N/A',
        stores: Math.floor(Math.random() * 5) + 1, // Random store count 1-5
        watching: generateWatchingCount(),
        link: `/us/product/${slug}`
      };
    });

  } catch (error) {
    console.error('Error fetching US products:', error);
  }

  return (
    <>
      <div className="products-grid-mobile" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        width: '100%'
      }}>
        {products.map((product) => (
          <div key={product.id} className="swiper-slide" style={{
            width: '100%',
            minWidth: '0',
            flex: 'none',
            marginRight: '0',
            opacity: '1',
            visibility: 'visible',
            transform: 'none',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div className="product-card" style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Product Image */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '120px',
                marginBottom: '8px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#f8f9fa'
              }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  className="product-image"
                />
              </div>

              {/* Product Info */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <div className="product-brand" style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  {product.brand}
                </div>
                
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  margin: '0 0 4px 0',
                  lineHeight: '1.3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.name}
                </h3>

                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  {product.strength} • {product.format}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto'
                }}>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      {product.price}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#666'
                    }}>
                      {product.stores} stores
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '8px'
                }}>
                  <button
                    className="price-alert-btn"
                    data-product-id={product.id}
                    data-product-name={product.name}
                    data-product-brand={product.brand}
                    data-product-price={product.price}
                    style={{
                      flex: '1',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '11px',
                      color: '#666',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                    Alert
                  </button>
                  
                  <button
                    className="wishlist-btn"
                    data-product-id={product.id}
                    data-product-name={product.name}
                    data-product-brand={product.brand}
                    style={{
                      flex: '1',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '11px',
                      color: '#666',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Save
                  </button>
                </div>
              </div>

              {/* Product Link */}
              <Link 
                href={product.link}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  zIndex: '1'
                }}
                aria-label={`View ${product.name} details`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Client-side functionality */}
      <ProductButtonScript />
      <ClientPriceAlertModal />
    </>
  );
};

export default SSRUSProductGrid;
