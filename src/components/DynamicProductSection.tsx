'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLocalImagePath } from '@/utils/imageUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Product {
  id: number;
  name: string;
  brand: string;
  image_url: string;
  price: string;
  original_price: string;
  store_count: number;
  tracking_count: number;
  trend_score: number;
  strength_group: string;
  created_at?: string;
}

interface DynamicProductSectionProps {
  title: string;
  section: 'trending' | 'popular' | 'new';
  refreshInterval?: number;
  rotateCount?: number;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

export default function DynamicProductSection({
  title,
  section
}: DynamicProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePopup, setActivePopup] = useState<number | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<Set<number>>(new Set());
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const popupRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const triggerLoginModal = () => {
    window.dispatchEvent(new CustomEvent('triggerLoginModal'));
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    };

    if (activePopup !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopup]);

  // Fetch user's price alerts when logged in
  useEffect(() => {
    const fetchPriceAlerts = async () => {
      if (!user?.id) {
        setPriceAlerts(new Set());
        return;
      }

      try {
        const { data, error } = await supabase()
          .from('price_alerts')
          .select('product_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching price alerts:', error);
          return;
        }

        const alertProductIds = new Set<number>(
          data?.map((alert: any) => alert.product_id).filter(Boolean) || []
        );
        setPriceAlerts(alertProductIds);
      } catch (error) {
        console.error('Error fetching price alerts:', error);
      }
    };

    fetchPriceAlerts();

    // Listen for price alert updates to refresh
    const handleAlertUpdate = () => {
      fetchPriceAlerts();
    };
    window.addEventListener('priceAlertUpdated', handleAlertUpdate);

    return () => {
      window.removeEventListener('priceAlertUpdated', handleAlertUpdate);
    };
  }, [user?.id]);

  const handleBellClick = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePopup(activePopup === productId ? null : productId);
  };

  const handlePriceAlert = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      triggerLoginModal();
      setActivePopup(null);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
      // Dispatch site-wide price alert modal event with product data
      window.dispatchEvent(new CustomEvent('triggerPriceAlertModal', {
        detail: {
          productId: product.id,
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            flavour: '',
            strength_group: product.strength_group,
            format: 'Pouch',
            image_url: product.image_url,
            store_count: product.store_count
          }
        }
      }));
    }
    setActivePopup(null);
  };

  const handleAddToFavourites = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      triggerLoginModal();
      setActivePopup(null);
      return;
    }

    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
    setActivePopup(null);
  };

  // Each section uses offset 0 - the API scores products differently per section
  // (popular = store count, trending = recent clicks, new = recency)
  const getSectionOffset = () => {
    return 0;
  };

  // Initial load only - fetch fewer products on mobile
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const sectionOffset = getSectionOffset();
        // Mobile: 8 products, Desktop: 12 products (reduced from 15)
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const productLimit = isMobile ? 8 : 12;
        const response = await fetch(`/api/trending-products?section=${section}&limit=${productLimit}&offset=${sectionOffset}`);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [section]);

  if (loading) {
    return (
      <div style={{ width: '100%', padding: '24px 0' }}>
        <div style={{ width: '100%', padding: '0 20px' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            fontSize: '22px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: '#1f2544',
            letterSpacing: '-0.3px'
          }}>
            {title}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '160px',
                  height: '260px',
                  background: '#f0f0f0',
                  borderRadius: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', marginBottom: '32px' }}>
      {/* Section Header */}
      <div style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          fontSize: '22px',
          fontWeight: '700',
          margin: '0',
          color: '#1f2544',
          letterSpacing: '-0.3px'
        }}>
          {title}
        </h2>
      </div>

      {/* Products Grid */}
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
          {products.map((product, index) => {
            const slug = generateSlug(product.name);

            return (
              <div
                key={`${section}-${product.id}-${index}`}
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

                  {/* Watching Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    display: 'flex',
                    gap: '4px',
                    zIndex: 2
                  }}>
                    <div style={{
                      background: '#e5ff7d',
                      padding: '2px 6px',
                      borderRadius: '100px',
                      fontSize: '9px',
                      fontWeight: '600',
                      color: 'rgba(0, 0, 0, 0.9)',
                      letterSpacing: '-0.1px',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.4'
                    }}>
                      {product.tracking_count > 0 ? `${product.tracking_count} tracking` : 'Track price'}
                    </div>
                    {product.created_at && (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                      <div style={{
                        background: '#3b82f6',
                        padding: '2px 6px',
                        borderRadius: '100px',
                        fontSize: '9px',
                        fontWeight: '700',
                        color: '#fff',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.4',
                        textTransform: 'uppercase'
                      }}>
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Action Button with Dropdown */}
                  <div
                    ref={activePopup === product.id ? popupRef : null}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      zIndex: 100
                    }}
                  >
                    <button
                      onClick={(e) => handleBellClick(e, product.id)}
                      style={{
                        width: '26px',
                        height: '26px',
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={priceAlerts.has(product.id) ? "#facc15" : "none"} stroke={priceAlerts.has(product.id) ? "#ca8a04" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </button>

                    {/* Popup Menu */}
                    {activePopup === product.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '32px',
                          right: '0',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          padding: '8px 0',
                          minWidth: '160px',
                          zIndex: 1000,
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <button
                          onClick={(e) => handlePriceAlert(e, product.id)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#374151',
                            transition: 'background-color 0.2s ease',
                            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <svg width="14" height="14" fill={priceAlerts.has(product.id) ? "#facc15" : "none"} stroke={priceAlerts.has(product.id) ? "#ca8a04" : "currentColor"} viewBox="0 0 24 24">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {priceAlerts.has(product.id) ? 'Edit price alert' : 'Price alert'}
                        </button>

                        <button
                          onClick={(e) => handleAddToFavourites(e, product.id)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#374151',
                            transition: 'background-color 0.2s ease',
                            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill={wishlist.has(product.id) ? "#ef4444" : "none"} stroke={wishlist.has(product.id) ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {wishlist.has(product.id) ? 'Remove from favourites' : 'Add to favourites'}
                        </button>
                      </div>
                    )}
                  </div>

                  <Link href={`/product/${slug}`} style={{
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
                        {/* Star Rating */}
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
                        <span style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textDecoration: 'line-through',
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                        }}>
                          {product.original_price || `£${(parseFloat(product.price.replace(/[£$]/g, '')) * 1.25).toFixed(2)}`}
                        </span>
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
            );
          })}
        </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .product-image-container:hover .product-image-zoom {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
