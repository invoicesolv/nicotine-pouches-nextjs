'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

interface ProductCardWithDropdownProps {
  product: Product;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

// Global cache for user's price alerts to avoid multiple fetches
let priceAlertsCache: { userId: string; productIds: Set<number>; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute cache

export default function ProductCardWithDropdown({ product }: ProductCardWithDropdownProps) {
  const [activePopup, setActivePopup] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const popupRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const slug = generateSlug(product.name);

  const triggerLoginModal = () => {
    window.dispatchEvent(new CustomEvent('triggerLoginModal'));
  };

  // Fetch user's price alerts when logged in
  useEffect(() => {
    const fetchPriceAlerts = async () => {
      if (!user?.id) {
        setHasAlert(false);
        return;
      }

      // Check cache first
      if (priceAlertsCache &&
          priceAlertsCache.userId === user.id &&
          Date.now() - priceAlertsCache.timestamp < CACHE_DURATION) {
        setHasAlert(priceAlertsCache.productIds.has(product.id));
        return;
      }

      try {
        // Use Supabase directly to fetch user's price alerts
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

        // Update cache
        priceAlertsCache = {
          userId: user.id,
          productIds: alertProductIds,
          timestamp: Date.now()
        };

        setHasAlert(alertProductIds.has(product.id));
      } catch (error) {
        console.error('Error fetching price alerts:', error);
      }
    };

    fetchPriceAlerts();

    // Listen for price alert updates to refresh
    const handleAlertUpdate = () => {
      priceAlertsCache = null; // Invalidate cache
      fetchPriceAlerts();
    };
    window.addEventListener('priceAlertUpdated', handleAlertUpdate);

    return () => {
      window.removeEventListener('priceAlertUpdated', handleAlertUpdate);
    };
  }, [user?.id, product.id]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(false);
      }
    };

    if (activePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopup]);

  const handleBellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePopup(!activePopup);
  };

  const handlePriceAlert = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Dispatch site-wide price alert modal event with product data
    window.dispatchEvent(new CustomEvent('triggerPriceAlertModal', {
      detail: {
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          flavour: product.flavour,
          strength_group: product.strength,
          format: product.format,
          image_url: product.image,
          store_count: product.stores
        }
      }
    }));
    setActivePopup(false);
  };

  const handleAddToFavourites = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      triggerLoginModal();
      setActivePopup(false);
      return;
    }

    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
      } else {
        newSet.add(product.id);
      }
      return newSet;
    });
    setActivePopup(false);
  };

  return (
    <div className="swiper-slide" style={{
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

        {/* Watching Badge + NEW Badge */}
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
            {product.tracking > 0 ? `${product.tracking} tracking` : 'Track price'}
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
          ref={popupRef}
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            zIndex: 100
          }}
        >
          <button
            onClick={handleBellClick}
            style={{
              width: '26px',
              height: '26px',
              background: hasAlert ? '#fef9c3' : 'transparent',
              border: hasAlert ? '1px solid #facc15' : '1px solid #e5e7eb',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              transition: 'all 0.2s ease',
              boxShadow: hasAlert ? '0 2px 8px rgba(250, 204, 21, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={hasAlert ? "#facc15" : "none"} stroke={hasAlert ? "#ca8a04" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* Popup Menu */}
          {activePopup && (
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
                onClick={handlePriceAlert}
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
                <svg width="14" height="14" fill={hasAlert ? "#facc15" : "none"} stroke={hasAlert ? "#ca8a04" : "currentColor"} viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {hasAlert ? 'Edit price alert' : 'Price alert'}
              </button>

              <button
                onClick={handleAddToFavourites}
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
          {/* Square Image Container */}
          <div style={{
            width: '100%',
            paddingBottom: '100%',
            position: 'relative',
            marginBottom: '6px',
            borderRadius: '10px',
            overflow: 'hidden',
            background: '#fefefe'
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
                padding: '8px',
                boxSizing: 'border-box'
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
                £{(parseFloat(product.price.replace('£', '').replace('$', '')) * 1.25).toFixed(2)}
              </span>
            </div>

            {/* In Stock */}
            <p style={{
              fontSize: '10px',
              color: '#6b7280',
              margin: '0 0 4px 0',
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
            }}>
              In stock at {product.stores} {product.stores === 1 ? 'vendor' : 'vendors'}
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
                {product.stores}
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
}
