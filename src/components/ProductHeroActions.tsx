'use client';

import { useState } from 'react';
import ComparisonDialog from '@/components/ComparisonDialog';
import StrengthSelector from '@/components/StrengthSelector';

interface ProductHeroActionsProps {
  product: any;
  ratingData: {
    ratingValue: number;
    reviewCount: number;
  } | null;
  isUS?: boolean;
}

export default function ProductHeroActions({ product, ratingData, isUS = false }: ProductHeroActionsProps) {
  const currencySymbol = isUS ? '$' : '£';
  const handlePriceAlert = () => {
    if (typeof window !== 'undefined') {
      // Trigger the product-specific price alert modal
      window.dispatchEvent(new CustomEvent('triggerPriceAlertModal', {
        detail: {
          productId: product.id,
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand || product.name?.split(' ')[0],
            flavour: product.flavour || product.name,
            strength_group: product.strength || 'Normal',
            format: product.format || 'Pouch',
            image_url: product.image,
            store_count: product.stores?.length || 0
          }
        }
      }));
    }
  };

  // Calculate average vendor rating from Trustpilot scores
  const vendorRatings = product.stores
    ?.map((s: any) => parseFloat(s.trustpilot_score || s.rating || 0))
    .filter((r: number) => r > 0) || [];

  const averageVendorRating = vendorRatings.length > 0
    ? vendorRatings.reduce((sum: number, r: number) => sum + r, 0) / vendorRatings.length
    : 0;

  // Calculate price range
  const validPrices = product.stores
    ?.filter((s: any) => s.price)
    .map((s: any) => parseFloat(s.price.replace(/[£$]/g, '')))
    .filter((p: number) => !isNaN(p) && p > 0) || [];

  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  const storeCount = product.stores?.length || 0;

  return (
    <>
      {/* Action Row: Rating | Price Alert | Compare */}
      <div className="product-action-row" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        marginBottom: '16px',
        flexWrap: 'wrap',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}>
        {/* Rating - Average of all vendors */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          paddingRight: '16px',
          position: 'relative'
        }}>
          <span style={{ color: '#00b67a', fontSize: '16px' }}>★</span>
          <span style={{
            color: '#1f2544',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {averageVendorRating > 0 ? averageVendorRating.toFixed(1) : '4.5'}
          </span>
          {/* Info icon with tooltip */}
          <div
            className="rating-info-tooltip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'help',
              marginLeft: '2px',
              position: 'relative'
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span className="rating-tooltip-text">
              Average vendor rating from Trustpilot, not product-specific
            </span>
          </div>
          <style>{`
            .rating-info-tooltip .rating-tooltip-text {
              visibility: hidden;
              opacity: 0;
              position: absolute;
              left: 50%;
              top: 100%;
              transform: translateX(-50%);
              margin-top: 8px;
              background-color: #1f2937;
              color: #fff;
              font-size: 12px;
              font-weight: 400;
              padding: 8px 12px;
              border-radius: 6px;
              white-space: nowrap;
              z-index: 1000;
              transition: opacity 0.2s, visibility 0.2s;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .rating-info-tooltip .rating-tooltip-text::before {
              content: '';
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 6px solid transparent;
              border-bottom-color: #1f2937;
            }
            .rating-info-tooltip:hover .rating-tooltip-text {
              visibility: visible;
              opacity: 1;
            }
          `}</style>
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '16px',
          backgroundColor: '#e5e7eb',
          marginRight: '16px'
        }} />

        {/* Price Alert Button */}
        <button
          onClick={handlePriceAlert}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
            paddingRight: '16px',
            color: '#1f2544',
            fontSize: '13px',
            fontWeight: '500',
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Price alert
        </button>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '16px',
          backgroundColor: '#e5e7eb',
          marginRight: '16px'
        }} />

        {/* Compare Button */}
        <ComparisonDialog product={product} buttonStyle="inline" />
      </div>

      {/* Brand */}
      <div style={{
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '12px',
        fontWeight: '500',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}>
        {product.brand || product.name?.split(' ')[0] || 'Nicotine Pouches'}
      </div>

      {/* Price Comparison Summary */}
      {storeCount > 0 && validPrices.length > 0 && (
        <div style={{
          fontSize: '15px',
          color: '#374151',
          marginBottom: '24px',
          lineHeight: '1.5',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
        }}>
          <span>Compare prices from </span>
          <span style={{ fontWeight: '600', color: '#059669' }}>{currencySymbol}{minPrice.toFixed(2)}</span>
          {maxPrice > minPrice && (
            <>
              <span> to </span>
              <span style={{ fontWeight: '600' }}>{currencySymbol}{maxPrice.toFixed(2)}</span>
            </>
          )}
          <span style={{ color: '#9ca3af' }}> · </span>
          <span>Available at {storeCount} {storeCount === 1 ? 'vendor' : 'vendors'}</span>
        </div>
      )}

      {/* Strength Selector - wrapped for mobile positioning */}
      <div className="strength-selector-wrapper">
        <StrengthSelector product={product} isUS={isUS} />
      </div>
    </>
  );
}
