'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import USFilterSidebar from './USFilterSidebar';

interface FilterState {
  brands: string[];
  flavours: string[];
  strengths: string[];
  formats: string[];
  priceRange: { min: number; max: number } | null;
}

interface USProductGridProps {
  brandFilter?: string;
}

const USProductSection = ({ brandFilter }: USProductGridProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 products per page (5 rows of 4)
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    flavours: [],
    strengths: [],
    formats: [],
    priceRange: null
  });

  // Mobile filter state
  const [mobileFilters, setMobileFilters] = useState({
    brand: '',
    strength: '',
    format: ''
  });

  // Watching counts state and cache (same as homepage)
  const [watchingCounts, setWatchingCounts] = useState<Map<number, number>>(new Map());
  const [watchingCache, setWatchingCache] = useState<Map<number, number>>(new Map());

  // Function to generate watching count between 400-800, round up to nearest hundred (same as homepage)
  const generateWatchingCount = (min: number = 400, max: number = 800) => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const rounded = Math.ceil(count / 100) * 100;
    return rounded;
  };

  // Fetch real watching counts from database with caching (same as homepage)
  const fetchWatchingCounts = async (productIds: number[]) => {
    try {
      const watchingMap = new Map<number, number>();
      const uncachedIds: number[] = [];
      
      // Check cache first
      productIds.forEach(productId => {
        if (watchingCache.has(productId)) {
          watchingMap.set(productId, watchingCache.get(productId)!);
        } else {
          uncachedIds.push(productId);
        }
      });

      // If all watching counts are cached, return immediately
      if (uncachedIds.length === 0) {
        setWatchingCounts(watchingMap);
        return;
      }

      // Get wishlist counts for uncached products only
      const { data: wishlistData, error: wishlistError } = await supabase()
        .from('wishlist')
        .select('product_id')
        .in('product_id', uncachedIds);

      // Get price alert counts for uncached products only
      const { data: alertData, error: alertError } = await supabase()
        .from('price_alerts')
        .select('product_id')
        .in('product_id', uncachedIds);

      if (wishlistError || alertError) {
        console.error('Error fetching watching data:', wishlistError || alertError);
        return;
      }

      // Count occurrences for each uncached product
      const wishlistCounts = new Map<number, number>();
      const alertCounts = new Map<number, number>();

      wishlistData?.forEach((item: any) => {
        wishlistCounts.set(item.product_id, (wishlistCounts.get(item.product_id) || 0) + 1);
      });

      alertData?.forEach((item: any) => {
        alertCounts.set(item.product_id, (alertCounts.get(item.product_id) || 0) + 1);
      });

      // Process uncached products only
      const newCacheEntries = new Map<number, number>();
      uncachedIds.forEach(productId => {
        const wishlistCount = wishlistCounts.get(productId) || 0;
        const alertCount = alertCounts.get(productId) || 0;
        const baseCount = wishlistCount + alertCount;
        
        // Generate watching count between 400-800, rounded up to nearest hundred
        const generatedWatching = generateWatchingCount(400, 800);
        const totalWatching = baseCount + generatedWatching;
        
        const finalWatching = Math.max(400, totalWatching); // At least 400 watchers
        watchingMap.set(productId, finalWatching);
        newCacheEntries.set(productId, finalWatching);
      });

      // Update cache with new entries
      if (newCacheEntries.size > 0) {
        setWatchingCache(prev => {
          const newCache = new Map(prev);
          newCacheEntries.forEach((value, key) => newCache.set(key, value));
          return newCache;
        });
      }

      setWatchingCounts(watchingMap);
    } catch (error) {
      console.error('Error fetching watching counts:', error);
    }
  };

  useEffect(() => {
    const fetchUSProducts = async () => {
      try {
        setLoading(true);
        let query = supabase().from('us_products').select('*');

        // Apply brand filter if provided
        if (brandFilter) {
          query = query.ilike('name', `%${brandFilter}%`);
        }

        // Order by id
        query = query.order('id', { ascending: true });

        const { data, error } = await query;

        if (error) throw error;

        // Fetch US vendor product mappings to calculate real store counts
        const { data: mappings, error: mappingsError } = await supabase()
          .from('us_vendor_product_mapping')
          .select('product_id');

        if (mappingsError) {
          console.error('Error fetching US mappings:', mappingsError);
        }

        // Count stores per product
        const storeCounts = new Map<number, number>();
        mappings?.forEach((mapping: any) => {
          const count = storeCounts.get(mapping.product_id) || 0;
          storeCounts.set(mapping.product_id, count + 1);
        });

        // Fetch lowest prices from us_vendor_products_new for all mapped products
        const productIds = data.map((p: any) => p.id);
        const lowestPrices = new Map<number, string>();

        // Get all vendor products with their prices
        const { data: vendorProducts, error: vpError } = await supabase()
          .from('us_vendor_product_mapping')
          .select(`
            product_id,
            vendor_product,
            us_vendor_id
          `)
          .in('product_id', productIds);

        if (!vpError && vendorProducts && vendorProducts.length > 0) {
          // Get all unique vendor product names and vendor IDs
          const vendorProductLookups = vendorProducts.map((vp: any) => ({
            name: vp.vendor_product,
            us_vendor_id: vp.us_vendor_id,
            product_id: vp.product_id
          }));

          // Fetch prices from us_vendor_products_new
          const { data: priceData, error: priceError } = await supabase()
            .from('us_vendor_products_new')
            .select('name, us_vendor_id, price_1pack');

          if (!priceError && priceData) {
            // Create a lookup map for prices
            const priceLookup = new Map<string, number>();
            priceData.forEach((vp: any) => {
              const key = `${vp.us_vendor_id}-${vp.name}`;
              const price = parseFloat(vp.price_1pack?.toString().replace('$', '') || '0');
              if (price > 0) {
                priceLookup.set(key, price);
              }
            });

            // Find lowest price for each product
            vendorProductLookups.forEach((lookup: any) => {
              const key = `${lookup.us_vendor_id}-${lookup.name}`;
              const price = priceLookup.get(key);
              if (price) {
                const currentLowest = lowestPrices.get(lookup.product_id);
                const currentPrice = currentLowest ? parseFloat(currentLowest.replace('$', '')) : Infinity;
                if (price < currentPrice) {
                  lowestPrices.set(lookup.product_id, `$${price.toFixed(2)}`);
                }
              }
            });
          }
        }

        // Transform US product data to match expected format (same as homepage)
        const transformedProducts = data.map((product: any, index: number) => ({
          id: product.id,
          name: product.product_title || product.name,
          price: lowestPrices.get(product.id) || "$3.99", // Real lowest price or fallback
          strength: product.strength || 'Normal',
          stores: storeCounts.get(product.id) || 0, // Real store count from mappings
          watching: generateWatchingCount(400, 800), // Use same watching logic as homepage
          image: product.image_url,
          link: `/us/product/${(product.product_title || product.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          brand: product.brand || 'Unknown',
          flavour: product.flavour || 'Unknown',
          format: product.format || 'Slim',
          nicotine_strength: product.nicotine_mg_pouch || '8mg',
          manufacturer: product.td_element || 'Unknown'
        }));

        console.log('Fetched US products:', transformedProducts.length);
        console.log('Sample US products:', transformedProducts.slice(0, 3));
        console.log('Sample US product brands:', transformedProducts.slice(0, 10).map((p: any) => p.brand));
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);

        // Fetch watching counts for all products (same as homepage)
        const allProductIds = transformedProducts.map((p: any) => p.id);
        fetchWatchingCounts(allProductIds);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching US products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUSProducts();
  }, [brandFilter]);

  // Filter products based on selected filters
  useEffect(() => {
    // Don't filter if no products loaded yet
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Check if we're using mobile filters or desktop filters
    const hasMobileFilters = mobileFilters.brand || mobileFilters.strength || mobileFilters.format;
    const hasDesktopFilters = filters.brands.length > 0 || filters.flavours.length > 0 || 
                             filters.strengths.length > 0 || filters.formats.length > 0;

    if (hasMobileFilters) {
      // Apply mobile filters
      if (mobileFilters.brand) {
        filtered = filtered.filter(product => 
          product.brand.toLowerCase().includes(mobileFilters.brand.toLowerCase())
        );
      }
      if (mobileFilters.strength) {
        filtered = filtered.filter(product => 
          product.strength.toLowerCase().includes(mobileFilters.strength.toLowerCase())
        );
      }
      if (mobileFilters.format) {
        filtered = filtered.filter(product => 
          product.format.toLowerCase().includes(mobileFilters.format.toLowerCase())
        );
      }
    } else if (hasDesktopFilters) {
      // Apply desktop filters
      if (filters.brands.length > 0) {
        filtered = filtered.filter(product => {
          return filters.brands.includes(product.brand);
        });
      }

      if (filters.flavours.length > 0) {
        filtered = filtered.filter(product => 
          filters.flavours.some(flavour => 
            product.flavour.toLowerCase().includes(flavour.toLowerCase()) ||
            product.name.toLowerCase().includes(flavour.toLowerCase())
          )
        );
      }

      if (filters.strengths.length > 0) {
        filtered = filtered.filter(product => 
          filters.strengths.includes(product.strength)
        );
      }

      if (filters.formats.length > 0) {
        filtered = filtered.filter(product => 
          filters.formats.includes(product.format)
        );
      }

      if (filters.priceRange) {
        // Price filtering would be implemented here
      }
    }

    console.log('Filtering US products:', {
      totalProducts: products.length,
      filters,
      mobileFilters,
      filteredCount: filtered.length,
      sampleProducts: filtered.slice(0, 3).map(p => ({ name: p.name, brand: p.brand }))
    });

    setFilteredProducts(filtered);
  }, [products, filters, mobileFilters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    console.log('Received filter change:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Mobile filter handlers
  const handleMobileFilterChange = (filterType: string, value: string) => {
    setMobileFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const clearMobileFilters = () => {
    setMobileFilters({
      brand: '',
      strength: '',
      format: ''
    });
    setCurrentPage(1);
  };

  // Get unique values for mobile filter options
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand))).sort();
  const uniqueStrengths = Array.from(new Set(products.map(p => p.strength))).sort();
  const uniqueFormats = Array.from(new Set(products.map(p => p.format))).sort();

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
    // Use real watching count from database if available, otherwise use generated count
    const watchingCount = watchingCounts.get(product.id) || product.watching;
    
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
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2,
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
          }}>
            {watchingCount}+ watching
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
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
    <>
      <style jsx>{`
        /* Large Desktop (1400px+) */
        @media (min-width: 1400px) {
          .sidebar-mobile {
            width: 20% !important;
            min-width: 280px !important;
          }
          .products-mobile {
            width: 80% !important;
          }
          .products-grid-mobile {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 12px !important;
          }
        }
        
        /* Desktop (1200px - 1399px) */
        @media (min-width: 1200px) and (max-width: 1399px) {
          .sidebar-mobile {
            width: 22% !important;
            min-width: 260px !important;
          }
          .products-mobile {
            width: 78% !important;
          }
          .products-grid-mobile {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
        }
        
        /* Small Desktop (1024px - 1199px) */
        @media (min-width: 1024px) and (max-width: 1199px) {
          .sidebar-mobile {
            width: 25% !important;
            min-width: 240px !important;
          }
          .products-mobile {
            width: 75% !important;
          }
          .products-grid-mobile {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
          }
        }
        
        /* Tablet (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar-mobile {
            width: 30% !important;
            min-width: 200px !important;
          }
          .products-mobile {
            width: 70% !important;
          }
          .products-grid-mobile {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
        }
        
        /* Mobile (max-width: 767px) */
        @media (max-width: 767px) {
          .product-grid-container {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .sidebar-mobile {
            display: none !important;
          }
          .mobile-filters {
            display: block !important;
            background: #fff !important;
            padding: 15px !important;
            border-bottom: 1px solid #e5e7eb !important;
            margin-bottom: 0 !important;
          }
          .mobile-filter-row {
            display: flex !important;
            gap: 10px !important;
            flex-wrap: wrap !important;
            align-items: center !important;
          }
          .mobile-filter-select {
            flex: 1 !important;
            min-width: 120px !important;
            padding: 8px 12px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            background: #fff !important;
          }
          .mobile-filter-button {
            padding: 8px 16px !important;
            background: #1e40af !important;
            color: #fff !important;
            border: none !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
          }
          .products-mobile {
            width: 100% !important;
            order: 2 !important;
          }
          .products-grid-mobile {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 15px !important;
            padding: 15px !important;
          }
          .section-header-mobile {
            padding: 15px !important;
            margin-bottom: 0 !important;
          }
          .section-header-mobile h2 {
            font-size: 20px !important;
          }
        }
        
        /* Hide mobile filters on desktop */
        @media (min-width: 768px) {
          .mobile-filters {
            display: none !important;
          }
        }
        
        /* Small Mobile (max-width: 480px) */
        @media (max-width: 480px) {
          .mobile-filter-row {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .mobile-filter-select {
            width: 100% !important;
            min-width: auto !important;
          }
          .mobile-filter-button {
            width: 100% !important;
          }
          .products-grid-mobile {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            padding: 10px !important;
          }
        }
      `}</style>
      
      <div className="product-grid-container" style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        width: '100%',
        minHeight: '600px',
        backgroundColor: '#f4f5f9',
        padding: '0',
        margin: '0'
      }}>
        {/* Mobile Filters - Only visible on mobile */}
        <div className="mobile-filters" style={{ display: 'none' }}>
          <div className="mobile-filter-row">
            <select 
              className="mobile-filter-select"
              value={mobileFilters.brand}
              onChange={(e) => handleMobileFilterChange('brand', e.target.value)}
            >
              <option value="">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            
            <select 
              className="mobile-filter-select"
              value={mobileFilters.strength}
              onChange={(e) => handleMobileFilterChange('strength', e.target.value)}
            >
              <option value="">All Strengths</option>
              {uniqueStrengths.map(strength => (
                <option key={strength} value={strength}>{strength}</option>
              ))}
            </select>
            
            <select 
              className="mobile-filter-select"
              value={mobileFilters.format}
              onChange={(e) => handleMobileFilterChange('format', e.target.value)}
            >
              <option value="">All Formats</option>
              {uniqueFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
            
            <button 
              className="mobile-filter-button"
              onClick={clearMobileFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Sidebar - 18% of space on desktop, hidden on mobile */}
        <div className="sidebar-mobile" style={{
          flexShrink: 0,
          width: '18%',
          backgroundColor: '#fff',
          borderRight: '1px solid #e5e7eb'
        }}>
          <USFilterSidebar onFiltersChange={handleFiltersChange} />
        </div>
      
        {/* Products Section - 82% of space on desktop, full width on mobile */}
        <div className="products-mobile" style={{
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
          <div className="section-header-mobile fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
               style={{ width: '100%', marginBottom: '10px' }}>
            <div className="fusion-column-wrapper">
              <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
                <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                     style={{ width: '50%' }}>
                  <div className="fusion-column-wrapper">
                    <h2 style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      fontSize: '24px',
                      fontWeight: '400',
                      margin: '0',
                      color: '#333',
                      letterSpacing: '-0.3px'
                    }}>
                      US Products
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
              
              <div className="products-grid-mobile swiper-wrapper" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                padding: '0',
                boxSizing: 'border-box',
                width: '100%'
              }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '18px', color: '#666' }}>Loading US products...</div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '18px', color: '#d63384' }}>Error loading US products: {error}</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '18px', color: '#666' }}>No US products match your filters</div>
                </div>
              ) : (
                currentProducts.map(renderProductCard)
              )}
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '30px',
            padding: '20px 0',
            borderTop: '1px solid #e5e7eb'
          }}>
            {/* Results info */}
            <div style={{
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              color: '#666',
              fontWeight: '500'
            }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} US products
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
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
    </>
  );
};

export default USProductSection;
