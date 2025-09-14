'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import FilterSidebar from './FilterSidebar';

interface FilterState {
  brands: string[];
  flavours: string[];
  strengths: string[];
  formats: string[];
  vendors: string[];
  priceRange: { min: number; max: number } | null;
}

interface ProductGridProps {
  brandFilter?: string;
  vendorFilter?: string;
}

const ProductSection = ({ brandFilter, vendorFilter }: ProductGridProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 products per page (5 rows of 4)
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    flavours: [],
    strengths: [],
    formats: [],
    vendors: [],
    priceRange: null
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: any[] = [];

        if (vendorFilter) {
          // For vendor filtering, get products through vendor_product_mapping
          const { data: vendor, error: vendorError } = await supabase()
            .from('vendors')
            .select('id')
            .ilike('name', `%${vendorFilter}%`)
            .single();

          if (vendorError || !vendor) {
            throw new Error('Vendor not found');
          }

          // Get mapped products for this vendor
          const { data: mappings, error: mappingError } = await supabase()
            .from('vendor_product_mapping')
            .select('product_id')
            .eq('vendor_id', vendor.id);

          if (mappingError) {
            throw mappingError;
          }

          if (mappings && mappings.length > 0) {
            const productIds = mappings.map((m: any) => m.product_id);
            const { data: productData, error: productError } = await supabase()
              .from('products')
              .select('*')
              .in('id', productIds);

            if (productError) {
              throw productError;
            }
            data = productData || [];
          }
        } else {
          // For brand filtering or no filter, get products directly
          let query = supabase().from('products').select('*');
          
          // Apply brand filter if provided
          if (brandFilter) {
            query = query.ilike('brand', `%${brandFilter}%`);
          }
          
          const { data: productData, error } = await query;
          
          if (error) {
            throw error;
          }
          
          data = productData || [];
        }

        // Transform data to match expected format
        const transformedProducts = data.map((product: any, index: number) => ({
          id: product.id,
          name: product.name,
          price: "£3.99", // Default price since we don't have price data yet
          strength: product.strength_group,
          stores: Math.floor(Math.random() * 5) + 1, // Random store count
          watching: Math.floor(Math.random() * 30) + 10, // Random watching count
          image: product.image_url || '/placeholder-product.jpg',
          link: `/product/${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          brand: product.brand,
          flavour: product.flavour,
          format: product.format
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts().catch((error) => {
      console.error('Unhandled error in fetchProducts:', error);
      setError('Failed to load products');
      setLoading(false);
    });
  }, [brandFilter, vendorFilter]);

  // Filter products based on selected filters
  useEffect(() => {
    // Don't filter if no products loaded yet
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Only apply filters if any are selected
    const hasFilters = filters.brands.length > 0 || filters.flavours.length > 0 || 
                      filters.strengths.length > 0 || filters.formats.length > 0 || 
                      filters.vendors.length > 0;

    if (hasFilters) {
      // Filter by brands
      if (filters.brands.length > 0) {
        filtered = filtered.filter(product => {
          return filters.brands.includes(product.brand);
        });
      }

      // Filter by flavours - make it more flexible
      if (filters.flavours.length > 0) {
        filtered = filtered.filter(product => 
          filters.flavours.some(flavour => 
            product.flavour.toLowerCase().includes(flavour.toLowerCase()) ||
            product.name.toLowerCase().includes(flavour.toLowerCase())
          )
        );
      }

      // Filter by strengths
      if (filters.strengths.length > 0) {
        filtered = filtered.filter(product => 
          filters.strengths.includes(product.strength)
        );
      }

      // Filter by formats
      if (filters.formats.length > 0) {
        filtered = filtered.filter(product => 
          filters.formats.includes(product.format)
        );
      }

      // Filter by vendors
      if (filters.vendors.length > 0) {
        // For now, we'll skip vendor filtering in the client-side filter
        // This would be better implemented by pre-fetching vendor-product mappings
        // or by doing the filtering on the server side
        console.log('Vendor filtering not implemented in client-side filtering yet');
      }

      // Filter by price range (if we had price data)
      if (filters.priceRange) {
        // For now, we'll skip price filtering since we don't have real price data
        // This would be implemented when we have actual price information
      }
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    try {
      // Check if filters actually changed (not just initialization)
      const hasActualChanges = 
        JSON.stringify(newFilters.brands) !== JSON.stringify(filters.brands) ||
        JSON.stringify(newFilters.flavours) !== JSON.stringify(filters.flavours) ||
        JSON.stringify(newFilters.strengths) !== JSON.stringify(filters.strengths) ||
        JSON.stringify(newFilters.formats) !== JSON.stringify(filters.formats) ||
        JSON.stringify(newFilters.vendors) !== JSON.stringify(filters.vendors) ||
        JSON.stringify(newFilters.priceRange) !== JSON.stringify(filters.priceRange);
      
      setFilters(newFilters);
      
      // Only reset page if filters actually changed
      if (hasActualChanges) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error in handleFiltersChange:', error);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);


  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };


  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Normal':
        return { bg: '#E6FFE6', color: '#228B22' };
      case 'Strong':
        return { bg: '#FFF2CC', color: '#D6B656' };
      case 'Extra Strong':
        return { bg: '#FFE6E6', color: '#D63384' };
      default:
        return { bg: '#E6FFE6', color: '#228B22' };
    }
  };

  const renderProductCard = (product: any) => {
    const strengthStyle = getStrengthColor(product.strength);
    
    return (
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
        <div className="product-card" 
             data-product-id={product.id}
             style={{
               position: 'relative',
               background: 'transparent',
               backgroundColor: 'transparent',
               borderRadius: '0',
               overflow: 'visible',
               transition: 'transform 0.2s',
               height: '100%',
               display: 'flex',
               flexDirection: 'column',
               padding: '0',
               boxShadow: 'none',
               width: '100%',
               cursor: 'pointer',
               margin: '0',
               minHeight: '200px',
               opacity: '1',
               visibility: 'visible'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-1px)';
             }}>
          
          {/* Watching Badge */}
          <div className="watching-badge" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#e5ff7d',
            padding: '3px 8px',
            borderRadius: '100px',
            fontSize: '11px',
            fontFamily: '"Klarna 600", system-ui, -apple-system, sans-serif',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2,
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
          }}>
            {product.watching}+ watching
          </div>
          
          {/* Button Group */}
          <div className="button-group" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px',
            zIndex: 100
          }}>
            <div className="alert-button">
              <button className="price-alert-toggle" 
                      data-product-id={product.id}
                      data-nonce="0510cae8a4"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        transition: 'all 0.2s ease',
                        margin: '0'
                      }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>

            <div className="favorite-button">
              <button className="wishlist-toggle" 
                      data-product-id={product.id}
                      data-nonce="0510cae8a4"
                      data-is-in-wishlist="false"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        transition: 'all 0.2s ease',
                        margin: '0'
                      }}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <Link href={product.link} className="product-link" style={{ 
            position: 'relative',
            zIndex: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            pointerEvents: 'auto'
          }}>
            <div className="product-image" style={{
              width: '100%',
              paddingBottom: '60%',
              position: 'relative',
              marginBottom: '8px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#fefefe',
              border: '1px solid #e0e0e0'
            }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '12px',
                  margin: '0',
                  border: 'none',
                  borderRadius: '0',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="product-details" style={{ 
              padding: '4px',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              margin: '0',
              background: 'transparent',
              border: 'none'
            }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <h2 className="product-title" style={{
                      fontSize: '14px',
                      fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                      fontWeight: '500',
                      color: '#000',
                      margin: '0',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      lineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      boxOrient: 'vertical',
                      overflow: 'hidden',
                      maxHeight: '2.6em',
                      letterSpacing: '-0.2px',
                      padding: '0',
                      textAlign: 'left',
                      flex: '1',
                      minWidth: '0'
                    }}>
                      {product.name}
                    </h2>

                    <span className="product-strength-label" 
                          style={{
                            backgroundColor: strengthStyle.bg,
                            color: strengthStyle.color,
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontFamily: '"Klarna 600", system-ui, -apple-system, sans-serif',
                            fontWeight: '600',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                      {product.strength}
                    </span>
                  </div>

              <div className="rating-price-container" style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div className="product-price" style={{
                  fontSize: '14px',
                  fontFamily: '"Klarna 600", system-ui, -apple-system, sans-serif',
                  fontWeight: '600',
                  color: '#000',
                  letterSpacing: '-0.2px',
                  margin: '0',
                  padding: '0',
                  lineHeight: '1'
                }}>
                  {product.price}
                </div>
              </div>

              <div className="store-count" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '10px',
                fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                color: '#666',
                marginTop: '4px',
                letterSpacing: '-0.2px',
                lineHeight: '1'
              }}>
                <span className="store-count-badge" style={{
                  fontWeight: '500',
                  color: '#666'
                }}>
                  {product.stores}
                </span>
                <span className="store-count-text" style={{ color: '#666' }}>stores</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start',
      width: '100%',
      minHeight: '600px',
      backgroundColor: '#f4f5f9',
      padding: '0',
      margin: '0'
    }}>
      {/* Sidebar - 18% of space */}
      <div style={{
        flexShrink: 0,
        width: '18%',
        backgroundColor: '#fff',
        borderRight: '1px solid #e5e7eb'
      }}>
        <FilterSidebar onFiltersChange={handleFiltersChange} />
      </div>
      
      {/* Products Section - 82% of space */}
      <div style={{
        flexShrink: 0,
        width: '82%',
        overflow: 'hidden'
      }}>
        <div style={{
           backgroundColor: '#f4f5f9',
               padding: '10px',
               width: '100%',
               margin: '0',
               boxSizing: 'border-box'
             }}>
          <div style={{
             width: '100%',
                 margin: '0',
                 padding: '0',
                 boxSizing: 'border-box'
           }}>
        
        {/* Section Header */}
        <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '10px' }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
              <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                   style={{ width: '50%' }}>
                <div className="fusion-column-wrapper">
                  <h2 style={{
                    fontFamily: '"Klarna 700"',
                    fontSize: '24px',
                    fontWeight: '400',
                    margin: '0',
                    color: '#333',
                    letterSpacing: '-0.3px'
                  }}>
                    Products
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* First Row - Products */}
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <div style={{
                 width: '100%',
                 padding: '0',
                 margin: '0',
                 overflow: 'hidden',
                 boxSizing: 'border-box'
               }}>
            
            <div className="swiper-wrapper" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              padding: '0',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '18px', color: '#666' }}>Loading products...</div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '18px', color: '#d63384' }}>Error loading products: {error}</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '18px', color: '#666' }}>No products match your filters</div>
                </div>
              ) : (
                currentProducts.map(renderProductCard)
              )}
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && !error && filteredProducts.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px',
            padding: '20px 0',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            width: '100%'
          }}>
            {/* Results info */}
            <div style={{
              fontSize: '14px',
              fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
              color: '#666',
              fontWeight: '500'
            }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
            </div>

            {/* Pagination buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {/* Previous button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Previous
              </button>

              {/* Page numbers */}
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === pageNum ? '#1e40af' : '#fff',
                        color: currentPage === pageNum ? '#fff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: currentPage === totalPages ? '#f9fafb' : '#fff',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = ({ brandFilter, vendorFilter }: ProductGridProps) => {
  return <ProductSection brandFilter={brandFilter} vendorFilter={vendorFilter} />;
};

export default ProductGrid;
