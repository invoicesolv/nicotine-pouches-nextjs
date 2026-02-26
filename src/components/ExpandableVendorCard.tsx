'use client';

import { useState, useEffect, useMemo } from 'react';
import VendorLogo from './VendorLogo';
import TrustpilotRating from './TrustpilotRating';
import StockNotificationButton from './StockNotificationButton';

interface ExpandableVendorCardProps {
  store: any;
  storeIndex: number;
  product: any;
  vendorReviewCountMap: Map<number, number>;
}

export default function ExpandableVendorCard({
  store,
  storeIndex,
  product,
  vendorReviewCountMap
}: ExpandableVendorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStrength, setSelectedStrength] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string | null>(null);
  const selectedPackSize = '1pack';

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

  // Get all strengths this store has
  const storeStrengths = useMemo(() => {
    return store.variants?.map((v: any) => v.strength || 'Standard') || ['Standard'];
  }, [store.variants]);

  // Find the variant matching selected strength, or use first variant
  const currentVariantIndex = useMemo(() => {
    if (!selectedStrength) return 0;
    const index = store.variants?.findIndex((v: any) => v.strength === selectedStrength);
    return index >= 0 ? index : 0;
  }, [selectedStrength, store.variants]);

  const currentVariant = store.variants?.[currentVariantIndex] || store;

  // Listen for strength change events
  useEffect(() => {
    const handleStrengthChange = (event: CustomEvent) => {
      setSelectedStrength(event.detail?.strength || null);
    };

    window.addEventListener('strengthChange', handleStrengthChange as EventListener);
    return () => {
      window.removeEventListener('strengthChange', handleStrengthChange as EventListener);
    };
  }, []);

  // Check if this store should be visible based on selected strength
  const isVisible = useMemo(() => {
    if (!selectedStrength) return true;
    return storeStrengths.includes(selectedStrength);
  }, [selectedStrength, storeStrengths]);

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

      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Unknown';
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate shipping info - use the exact shipping_info text from admin
  const getShippingInfo = () => {
    const packPrice = parseFloat(store.price?.replace(/[£€$]/g, '').replace(/,/g, '').trim() || '0');
    const freeThreshold = typeof store.free_shipping_threshold === 'string'
      ? parseFloat(store.free_shipping_threshold) || 0
      : (store.free_shipping_threshold || 0);
    const shippingCost = typeof store.shipping_cost === 'string'
      ? parseFloat(store.shipping_cost) || 0
      : (store.shipping_cost || 0);

    // Use the exact shipping_info text from admin
    const shippingText = store.shipping_info || 'Standard shipping';
    const isFree = shippingCost === 0 || (packPrice >= freeThreshold && freeThreshold > 0);

    return { text: shippingText, isFree };
  };

  // Get formatted price
  const getPrice = () => {
    if (!store.price) return null;
    const priceStr = store.price.toString().trim();
    if (/^£/.test(priceStr)) return priceStr;
    const priceNum = parseFloat(priceStr.replace(/[£€$]/g, '').replace(/,/g, '').trim() || '0');
    if (isNaN(priceNum) || priceNum <= 0) return null;
    return `£${priceNum.toFixed(2)}`;
  };

  // Don't render if filtered out by strength
  if (!isVisible) {
    return null;
  }

  const shippingInfo = getShippingInfo();
  const price = getPrice();
  const productLink = store.variants?.[0]?.link || store.url || '#';
  const productName = store.variants?.[0]?.product || store.name || 'Unknown';

  // MOBILE LAYOUT - Simple Google Shopping style
  if (isMobile) {
    return (
      <div
        className="vendor-card"
        data-store-index={storeIndex}
        data-vendor-id={store.vendorId || storeIndex}
        data-vendor-name={store.name}
        data-price={currentVariant?.prices?.['1pack']?.replace('£', '') || '0'}
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
            <span style={{
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

        {/* Offer Badge */}
        {store.offer_type && store.offer_value && String(store.offer_value).trim() !== '' && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: store.offer_type === 'percentage_discount' ? '#e8f5e9' : '#fff3e0',
            borderTop: `1px solid ${store.offer_type === 'percentage_discount' ? '#c8e6c9' : '#ffe0b2'}`,
            fontSize: '12px',
            fontWeight: '600',
            color: store.offer_type === 'percentage_discount' ? '#2e7d32' : '#e65100'
          }}>
            {store.offer_type === 'percentage_discount'
              ? `${Number(store.offer_value)}% OFF`
              : `+${Number(store.offer_value)} Extra Pouches`}
            {store.offer_description && (
              <span style={{ fontWeight: '400', marginLeft: '4px' }}>
                - {store.offer_description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // DESKTOP LAYOUT - Original full layout
  return (
    <div
      className="vendor-card"
      data-store-index={storeIndex}
      data-vendor-id={store.vendorId || storeIndex}
      data-vendor-name={store.name}
      data-price={currentVariant?.prices?.['1pack']?.replace('£', '') || '0'}
      data-store-name={store.name}
      data-shipping={store.shipping || store.shipping_info || 'Standard shipping'}
      data-rating={store.trustpilot_score?.toString() || store.rating?.toString() || '0'}
      data-available-packs={JSON.stringify(Object.keys(currentVariant?.prices || store.prices || {}))}
      data-strength={currentVariant?.strength || 'Standard'}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}>

      {/* Top Section - Logo, Vendor Name, and Variants */}
      <div className="comparison-table-top" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem 0.75rem 3.87rem',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        {/* Chevron down icon before vertical border line */}
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
          <a href={`/vendor/${store.name.toLowerCase().replace(/\s+/g, '-')}`} rel="nofollow">
            <VendorLogo
              logo={store.logo}
              name={store.name}
              size={44}
            />
          </a>
          <a
            href={`/vendor/${store.name.toLowerCase().replace(/\s+/g, '-')}`}
            rel="nofollow"
            style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#1f2937',
              textDecoration: 'none'
            }}
            className="hover:text-blue-600 transition-colors"
          >
            {store.name}
          </a>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px'
          }}>
            <TrustpilotRating score={store.trustpilot_score} size={16} />
            {/* Use review_count from vendor data, fallback to vendorReviewCountMap */}
            {(store.review_count > 0 || (vendorReviewCountMap.has(store.vendorId) && vendorReviewCountMap.get(store.vendorId)! > 0)) && (
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '400'
              }}>
                ({store.review_count || vendorReviewCountMap.get(store.vendorId)} {(store.review_count || vendorReviewCountMap.get(store.vendorId)) === 1 ? 'review' : 'reviews'})
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
              className="product-title-link"
              style={{
                fontSize: '0.9rem',
                color: '#0073aa',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
              {productName}
              <span className="pack-size-display" style={{ color: '#6b7280', fontSize: '0.85rem' }}> ({product.selectedPack.replace('pack', '')} Pack)</span>
            </a>

            {/* Out of Stock Badge and Notification Button */}
            {currentVariant && !currentVariant.in_stock && (
              <>
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
                <StockNotificationButton
                  productName={currentVariant.product || store.name}
                  vendorName={store.name}
                  productId={product.id}
                />
              </>
            )}
          </div>

          {/* Variant Selection */}
          {store.variants && store.variants.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              marginTop: '4px'
            }}>
              {store.variants.map((variant: any, variantIndex: number) => (
                <button
                  key={variantIndex}
                  className="variant-button"
                  data-store-index={storeIndex}
                  data-variant-index={variantIndex}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '8px',
                    border: variantIndex === 0 ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                    backgroundColor: variantIndex === 0 ? '#eff6ff' : '#fff',
                    color: variantIndex === 0 ? '#1d4ed8' : '#6b7280',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {variant.strength}
                </button>
              ))}
            </div>
          )}
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
              {store.price && (() => {
                const packSizeNumber = parseInt(product.selectedPack.replace('pack', '') || '1');
                const packPrice = parseFloat(store.price.replace(/[£€$]/g, '').replace(/,/g, '').trim() || '0');
                const pricePerPouch = packPrice / packSizeNumber;
                return (
                  <>
                    <span>£{pricePerPouch.toFixed(2)} per pouch</span>
                    <span style={{ color: '#d1d5db' }}>·</span>
                  </>
                );
              })()}
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

      {/* Offer Badge - Display at bottom in its own row */}
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
