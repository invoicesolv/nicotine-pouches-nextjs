'use client';

import { useState, useEffect } from 'react';
import VendorLogo from './VendorLogo';
import TrustpilotRating from './TrustpilotRating';

interface ExpandableUSVendorCardProps {
  store: any;
  storeIndex: number;
  selectedPack?: string;
}

export default function ExpandableUSVendorCard({
  store,
  storeIndex,
  selectedPack = '1pack'
}: ExpandableUSVendorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set time ago after mount to avoid hydration mismatch
  useEffect(() => {
    if (store.updated_at) {
      setTimeAgo(formatTimeAgo(store.updated_at));
    }
  }, [store.updated_at]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Unknown';
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get shipping info
  const getShippingInfo = () => {
    const shippingCost = store.shipping_cost || 0;
    const deliverySpeed = store.delivery_speed || '3-5 days';

    if (shippingCost === 0) {
      return { text: `Free shipping, ${deliverySpeed}`, isFree: true };
    }
    return { text: `$${shippingCost.toFixed(2)} shipping, ${deliverySpeed}`, isFree: false };
  };

  // Get price for current pack size
  const getPrice = () => {
    return store.prices?.[selectedPack] || store.prices?.['1pack'] || store.price || 'N/A';
  };

  const shippingInfo = getShippingInfo();
  const price = getPrice();
  const rawProductLink = store.link || '#';
  const productName = store.product || store.name || 'Unknown';

  // Append UTM parameters to outgoing vendor links
  const productLink = (() => {
    if (rawProductLink === '#') return '#';
    try {
      const url = new URL(rawProductLink);
      url.searchParams.set('utm_source', 'nicotine-pouches.org');
      url.searchParams.set('utm_medium', 'price-comparison');
      url.searchParams.set('utm_campaign', 'product-listing');
      return url.toString();
    } catch {
      const sep = rawProductLink.includes('?') ? '&' : '?';
      return `${rawProductLink}${sep}utm_source=nicotine-pouches.org&utm_medium=price-comparison&utm_campaign=product-listing`;
    }
  })();

  // Calculate price per pouch (price divided by pack count)
  const calculatePricePerPouch = () => {
    const packSizeNumber = parseInt(selectedPack.replace('pack', '') || '1');
    const priceValue = parseFloat(price.replace(/[$,]/g, '') || '0');
    if (priceValue > 0 && packSizeNumber > 0) {
      const pricePerPouch = priceValue / packSizeNumber;
      return `$${pricePerPouch.toFixed(2)} per pouch`;
    }
    return null;
  };

  const pricePerPouch = calculatePricePerPouch();

  // MOBILE LAYOUT - Simple Google Shopping style
  if (isMobile) {
    return (
      <div
        className="vendor-card"
        data-store-index={storeIndex}
        data-vendor-id={store.vendorId}
        data-vendor-name={store.name}
        data-price={store.prices?.['1pack']?.replace('$', '') || '0'}
        suppressHydrationWarning
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
        }}>

        {/* Row 1: Chevron + Logo + Store name + Shipping info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 12px 8px 12px',
          gap: '10px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          {/* Chevron */}
          <button
            onClick={toggleExpand}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Logo */}
          <VendorLogo logo={store.logo} name={store.name} size={36} />

          {/* Store name + Shipping */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#202124',
              marginBottom: '2px'
            }}>
              {store.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#5f6368'
            }}>
              {storeIndex === 0 && <span style={{ color: '#188038' }}>Lowest price · </span>}
              <span style={{ color: shippingInfo.isFree ? '#188038' : '#5f6368' }}>
                {shippingInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Product link + Price + Arrow */}
        <a
          href={productLink}
          target="_blank"
          rel="nofollow"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            textDecoration: 'none',
            gap: '12px'
          }}
        >
          {/* Product name */}
          <div style={{
            fontSize: '13px',
            color: '#1a0dab',
            fontWeight: '500',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0
          }}>
            {productName}
          </div>

          {/* Price + Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <span className="price-display" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#202124'
            }}>
              {price}
            </span>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path d="M1.5 1L6.5 6L1.5 11" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </a>
      </div>
    );
  }

  // DESKTOP LAYOUT - Matching UK style
  return (
    <div
      key={storeIndex}
      className="vendor-card"
      data-store-index={storeIndex}
      data-vendor-id={store.vendorId}
      data-vendor-name={store.name}
      data-price={store.prices?.['1pack']?.replace('$', '') || '0'}
      data-store-name={store.name}
      suppressHydrationWarning
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}>

      {/* Top Section - Logo and Vendor Name */}
      <div className="comparison-table-top" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem 0.75rem 3.87rem',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        {/* Chevron down icon */}
        <button
          className="comparison-chevron"
          onClick={toggleExpand}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isExpanded ? '180deg' : '0deg'})`,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '4px',
            transition: 'transform 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M2 2L8 8L14 2" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Vertical border line */}
        <div className="comparison-vertical-border" style={{
          position: 'absolute',
          left: '40px',
          top: '0',
          width: '2px',
          height: '100%',
          backgroundColor: '#f5f5f5'
        }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <VendorLogo
            logo={store.logo}
            name={store.name}
            size={44}
          />
          <span style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {store.name}
          </span>
          {/* Rating display - using TrustpilotRating component like UK */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px'
          }}>
            <TrustpilotRating score={store.trustpilot_score || store.rating} size={16} />
            {(store.review_count > 0) && (
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '400'
              }}>
                ({store.review_count} {store.review_count === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>
        </div>

        {/* Last Updated Badge */}
        {store.updated_at && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            fontSize: '0.7rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Updated {timeAgo || ''}</span>
          </div>
        )}
      </div>

      {/* Expandable Shop Now Row */}
      {isExpanded && (
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          <a
            href={productLink}
            target="_blank"
            rel="nofollow"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '12px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333333';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            Shop Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      )}

      {/* Bottom Section - Product Details and Price */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem 1rem 1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: '1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <a href={productLink}
              target="_blank"
              rel="nofollow"
              className="product-title-link"
              style={{
                fontSize: '0.9rem',
                color: '#0073aa',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
              {productName}
              <span className="pack-size-display" style={{ color: '#6b7280', fontSize: '0.85rem' }}> ({selectedPack.replace('pack', '')} Pack)</span>
            </a>

            {/* Out of Stock Badge */}
            {store.in_stock === false && (
              <span style={{
                padding: '2px 8px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
          }}>
            {/* Price */}
            <span className="price-display" style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {price}
            </span>

            {/* Info Row - Lowest price · per pouch · shipping - all horizontal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#6b7280',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
              {storeIndex === 0 && (
                <>
                  <span style={{ color: '#059669', fontWeight: '500' }}>Lowest price</span>
                  <span style={{ color: '#d1d5db' }}>·</span>
                </>
              )}
              {pricePerPouch && (
                <>
                  <span>{pricePerPouch}</span>
                  <span style={{ color: '#d1d5db' }}>·</span>
                </>
              )}
              {/* Shipping */}
              <span style={{ color: shippingInfo.isFree ? '#059669' : '#6b7280' }}>
                {shippingInfo.text}
              </span>
            </div>
          </div>

          <a href={productLink}
            target="_blank"
            rel="nofollow"
            className="buy-now-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              borderRadius: '4px'
            }}>
            <span style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              fontWeight: 'bold'
            }}>
              &gt;
            </span>
          </a>
        </div>
      </div>

      {/* Offer Badge - Display at bottom in its own row (if US vendors have offers) */}
      {store.offer_type && store.offer_value && String(store.offer_value).trim() !== '' && (
        <div style={{
          padding: '12px 1.5rem',
          backgroundColor: store.offer_type === 'percentage_discount' ? '#e8f5e9' : '#fff3e0',
          borderTop: `2px solid ${store.offer_type === 'percentage_discount' ? '#4caf50' : '#ff9800'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '6px',
          width: '100%'
        }}>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            color: store.offer_type === 'percentage_discount' ? '#2e7d32' : '#e65100',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            {store.offer_type === 'percentage_discount'
              ? `${Number(store.offer_value)}% OFF`
              : `+${Number(store.offer_value)} Extra Pouches`}
          </span>
          {store.offer_description && (
            <span style={{
              fontSize: '0.8rem',
              color: store.offer_type === 'percentage_discount' ? '#388e3c' : '#f57c00',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              - {store.offer_description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
