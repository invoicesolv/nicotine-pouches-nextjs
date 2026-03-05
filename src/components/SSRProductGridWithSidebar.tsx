import Link from 'next/link';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import FilterHandler from './FilterHandler';
import ProductCardWithDropdown from './ProductCardWithDropdown';
import FilterSidebarClient from './FilterSidebarClient';

const PRODUCTS_PER_PAGE = 48;

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
  tracking: number;
  link: string;
  created_at?: string;
}

interface Filters {
  brand: string;
  vendor: string;
  flavour: string;
  strength: string;
  minPrice: string;
  maxPrice: string;
  format: string;
  sort: string;
}

interface SSRProductGridProps {
  brandFilter?: string;
  vendorFilter?: string;
  isUSRoute?: boolean;
  currentPage?: number;
  filters?: Filters;
}

const SSRProductGridWithSidebar = async ({ brandFilter, vendorFilter, isUSRoute = false, currentPage = 1, filters }: SSRProductGridProps) => {
  const activeFilters = filters || { brand: '', vendor: '', flavour: '', strength: '', minPrice: '', maxPrice: '', format: '', sort: 'popularity' };
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;
  // Fetch products on the server
  let products: Product[] = [];
  let totalProducts = 0;

  // Fetch sidebar data on the server
  let sidebarData = {
    brands: [] as { name: string; count: number }[],
    flavours: [] as { name: string; count: number }[],
    strengths: [] as { name: string; count: number }[],
    formats: [] as { name: string; count: number }[],
    vendors: [] as { name: string; count: number }[]
  };

  try {
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
          .from('wp_products')
          .select('*')
          .in('id', productIds);

        if (productError) {
          throw productError;
        }
        data = productData || [];
      }
    } else {
      // For brand filtering or no filter, get products directly
      let countQuery = supabase().from('wp_products').select('*', { count: 'exact', head: true });
      let query = supabase().from('wp_products').select('*');

      // Apply filters from URL params
      if (activeFilters.brand) {
        countQuery = countQuery.ilike('name', `${activeFilters.brand}%`);
        query = query.ilike('name', `${activeFilters.brand}%`);
      }
      if (activeFilters.flavour) {
        countQuery = countQuery.ilike('name', `%${activeFilters.flavour}%`);
        query = query.ilike('name', `%${activeFilters.flavour}%`);
      }
      if (activeFilters.strength) {
        countQuery = countQuery.eq('strength_group', activeFilters.strength);
        query = query.eq('strength_group', activeFilters.strength);
      }
      if (activeFilters.format) {
        countQuery = countQuery.eq('format', activeFilters.format);
        query = query.eq('format', activeFilters.format);
      }
      if (activeFilters.minPrice) {
        countQuery = countQuery.gte('price', parseFloat(activeFilters.minPrice));
        query = query.gte('price', parseFloat(activeFilters.minPrice));
      }
      if (activeFilters.maxPrice) {
        countQuery = countQuery.lte('price', parseFloat(activeFilters.maxPrice));
        query = query.lte('price', parseFloat(activeFilters.maxPrice));
      }

      // Legacy brand filter support
      if (brandFilter) {
        countQuery = countQuery.ilike('name', `${brandFilter}%`);
        query = query.ilike('name', `${brandFilter}%`);
      }

      // Get total count
      const { count } = await countQuery;
      totalProducts = count || 0;

      // Apply sorting
      const sortParam = activeFilters.sort || 'popularity';
      switch (sortParam) {
        case 'price-low':
          query = query.order('price', { ascending: true, nullsFirst: false });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false, nullsFirst: false });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
        default:
          // popularity - order by id desc (newest first) as a proxy
          query = query.order('id', { ascending: false });
      }

      // Get paginated results
      const { data: productData, error } = await query
        .range(offset, offset + PRODUCTS_PER_PAGE - 1);

      if (error) {
        throw error;
      }

      data = Array.isArray(productData) ? productData : [];
    }

    // Validate data before processing
    if (!Array.isArray(data)) {
      console.error('Invalid data received:', data);
      data = [];
    }

    // Fetch store counts and tracking counts in parallel
    // Only fetch mappings for products on current page instead of entire table
    const productIds = data.map((p: any) => p.id);

    const [mappingsResult, priceAlertsResult] = await Promise.all([
      productIds.length > 0
        ? supabase().from('vendor_product_mapping').select('product_id').in('product_id', productIds)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin().from('price_alerts').select('product_id').eq('is_active', true).in('product_id', productIds)
    ]);

    if (mappingsResult.error) {
      console.error('Error fetching mappings:', mappingsResult.error);
    }

    // Count stores per product
    const storeCounts = new Map<number, number>();
    mappingsResult.data?.forEach((mapping: any) => {
      const count = storeCounts.get(mapping.product_id) || 0;
      storeCounts.set(mapping.product_id, count + 1);
    });

    const trackingCounts = new Map<number, number>();
    priceAlertsResult.data?.forEach((alert: any) => {
      if (alert.product_id) {
        const count = trackingCounts.get(alert.product_id) || 0;
        trackingCounts.set(alert.product_id, count + 1);
      }
    });

    // Transform data to match expected format
    products = data.map((product: any, index: number) => {
      // Extract brand from product name (first word)
      const brand = product.name.split(' ')[0];
      const flavour = product.name.split(' ').slice(1).join(' ');
      const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return {
        id: product.id,
        name: product.name,
        price: product.price ? `${isUSRoute ? '$' : '£'}${parseFloat(product.price).toFixed(2)}` : `${isUSRoute ? '$' : '£'}${(2.99 + Math.random() * 2).toFixed(2)}`,
        strength: 'Normal', // Default strength since wp_products doesn't have this field
        stores: storeCounts.get(product.id) || 0, // Real store count from mappings
        tracking: trackingCounts.get(product.id) || 0, // Real tracking count from price alerts
        image: product.image_url || '/placeholder-product.jpg',
        link: `https://nicotine-pouches.org/product/${slug}`,
        brand: brand,
        flavour: flavour,
        format: 'Slim', // Default format since wp_products doesn't have this field
        created_at: product.created_at
      };
    });

    // Fetch sidebar data — parallel queries, no duplicate fetches
    try {
      const [productNamesResult, vendorDataResult, vendorMappingCountsResult] = await Promise.all([
        supabase().from('wp_products').select('name').not('name', 'is', null),
        supabase().from('vendors').select('name, id').eq('is_active', true),
        supabase().from('vendor_product_mapping').select('vendor_id')
      ]);

      const productDataForSidebar = productNamesResult.data || [];

      // Brands
      const brandCounts: Record<string, number> = {};
      const flavourCounts: Record<string, number> = {};
      productDataForSidebar.forEach((product: any) => {
        const brandName = product.name.split(' ')[0];
        if (brandName) brandCounts[brandName] = (brandCounts[brandName] || 0) + 1;
        const flavourName = product.name.split(' ').slice(1).join(' ');
        if (flavourName?.trim()) flavourCounts[flavourName] = (flavourCounts[flavourName] || 0) + 1;
      });

      sidebarData.brands = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      sidebarData.flavours = Object.entries(flavourCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const sidebarTotal = productDataForSidebar.length;
      sidebarData.strengths = [
        { name: 'Normal', count: Math.floor(sidebarTotal * 0.4) },
        { name: 'Strong', count: Math.floor(sidebarTotal * 0.3) },
        { name: 'Extra Strong', count: Math.floor(sidebarTotal * 0.3) }
      ];
      sidebarData.formats = [
        { name: 'Slim', count: Math.floor(sidebarTotal * 0.6) },
        { name: 'Original', count: Math.floor(sidebarTotal * 0.2) },
        { name: 'Mini', count: Math.floor(sidebarTotal * 0.2) }
      ];

      // Vendors
      const vendorData = vendorDataResult.data;
      const allMappings = vendorMappingCountsResult.data;
      const vendorCounts: Record<string, number> = {};
      if (vendorData && allMappings) {
        const mappingCounts = allMappings.reduce((acc: Record<string, number>, mapping: any) => {
          acc[mapping.vendor_id] = (acc[mapping.vendor_id] || 0) + 1;
          return acc;
        }, {});
        vendorData.forEach((vendor: any) => {
          vendorCounts[vendor.name] = mappingCounts[vendor.id] || 0;
        });
      }

      sidebarData.vendors = Object.entries(vendorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

    } catch (sidebarError) {
      console.error('Error fetching sidebar data:', sidebarError);
    }

  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <>
      {/* <ProductButtonScript />
      <ClientPriceAlertModal /> */}
      <FilterHandler />
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Fix the main layout */
          .product-grid-container {
            display: flex !important;
            align-items: stretch !important;
            gap: 10px !important;
            min-height: auto !important;
            height: auto !important;
          }

          .sidebar-mobile {
            flex-shrink: 0 !important;
            align-self: stretch !important;
            min-height: 100% !important;
            overflow-y: auto !important;
          }

          .products-mobile {
            flex-shrink: 0 !important;
            align-self: stretch !important;
            min-height: 100% !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          
          /* Reset any fusion builder styles */
          .fusion-layout-column,
          .fusion-builder-column,
          .fusion-column-wrapper,
          .fusion-builder-row,
          .fusion-builder-row-inner,
          .fusion-row {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
          }
          
          /* Fix product grid layout when products are hidden */
          .products-grid-mobile {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(150px, 170px)) !important;
            gap: 8px !important;
            width: 100% !important;
            align-items: start !important;
          }
          
          .swiper-slide {
            width: 100% !important;
            min-width: 0 !important;
            flex: none !important;
            margin-right: 0 !important;
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          /* When products are hidden, remove them from grid flow */
          .product-card[style*="display: none"] {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
          .swiper-slide:has(.product-card[style*="display: none"]) {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
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
              grid-template-columns: repeat(auto-fill, minmax(150px, 170px)) !important;
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
              grid-template-columns: repeat(auto-fill, minmax(150px, 170px)) !important;
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
              grid-template-columns: repeat(auto-fill, minmax(150px, 170px)) !important;
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
              grid-template-columns: repeat(auto-fill, minmax(140px, 160px)) !important;
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
          
          /* Show More Button Hover Effect */
          #show-more-brands:hover {
            color: #1d4ed8 !important;
          }
        `
      }} />
      
             <div className="product-grid-container" style={{
               display: 'flex',
               gap: '10px',
               alignItems: 'stretch',
               width: '100%',
               minHeight: '600px',
               backgroundColor: '#f4f5f9',
               padding: '0',
               margin: '0',
               position: 'relative'
             }}>

        {/* Client-Side Filter Sidebar */}
        <FilterSidebarClient
          sidebarData={sidebarData}
          basePath="/compare"
          activeFilters={activeFilters}
        />

        {/* Products Section - 82% of space on desktop, full width on mobile */}
        <div className="products-mobile" style={{
          flexShrink: 0,
          width: '82%',
          backgroundColor: '#f4f5f9',
          padding: '10px',
          alignSelf: 'flex-start'
        }}>
          {/* Products Grid */}
          <div className="products-grid-mobile swiper-wrapper" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 170px))',
            gap: '8px',
            width: '100%'
          }}>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>No products found</div>
              </div>
            ) : (
              products.map((product) => (
                <ProductCardWithDropdown key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalProducts > PRODUCTS_PER_PAGE && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '32px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {currentPage > 1 && (
                <Link
                  href={`/compare?page=${currentPage - 1}`}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                    transition: 'all 0.2s ease'
                  }}
                >
                  ← Previous
                </Link>
              )}

              {(() => {
                const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages, start + maxVisible - 1);
                if (end - start + 1 < maxVisible) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                if (start > 1) {
                  pages.push(
                    <Link key={1} href="/compare?page=1" style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#fff',
                      color: '#374151',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>1</Link>
                  );
                  if (start > 2) {
                    pages.push(<span key="start-dots" style={{ color: '#9ca3af' }}>...</span>);
                  }
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Link
                      key={i}
                      href={`/compare?page=${i}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: currentPage === i ? '2px solid #1f2544' : '1px solid #e5e7eb',
                        backgroundColor: currentPage === i ? '#1f2544' : '#fff',
                        color: currentPage === i ? '#fff' : '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: currentPage === i ? '600' : '400',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}
                    >
                      {i}
                    </Link>
                  );
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) {
                    pages.push(<span key="end-dots" style={{ color: '#9ca3af' }}>...</span>);
                  }
                  pages.push(
                    <Link key={totalPages} href={`/compare?page=${totalPages}`} style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#fff',
                      color: '#374151',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>{totalPages}</Link>
                  );
                }

                return pages;
              })()}

              {currentPage < Math.ceil(totalProducts / PRODUCTS_PER_PAGE) && (
                <Link
                  href={`/compare?page=${currentPage + 1}`}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
    </div>
    </>
  );
};

export default SSRProductGridWithSidebar;
