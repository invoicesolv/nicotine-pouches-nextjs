'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getLocalImagePath } from '@/utils/imageUtils';

interface Product {
  id: number;
  name: string;
  brand: string;
  flavour: string;
  strength_group: string;
  format: string;
  image_url?: string;
  page_url?: string;
  description?: string;
  store_count: number;
}

interface ProductCardProps {
  product: Product;
  priceAlerts?: Set<number>;
  wishlist?: Set<number>;
  onPriceAlertClick?: (productId: number) => void;
  onHeartClick?: (productId: number) => void;
  onPriceAlertFromHeart?: (productId: number) => void;
  onAddToListFromHeart?: (productId: number) => void;
  showActions?: boolean;
  activePopup?: number | null;
  onSetActivePopup?: (productId: number | null) => void;
}

const ProductCard = ({
  product,
  priceAlerts = new Set(),
  wishlist = new Set(),
  onPriceAlertClick,
  onHeartClick,
  onPriceAlertFromHeart,
  onAddToListFromHeart,
  showActions = true,
  activePopup = null,
  onSetActivePopup
}: ProductCardProps) => {
  // Generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Generate random price (since we don't have price data)
  const generatePrice = () => {
    const prices = ['£2.99', '£3.49', '£3.99', '£4.49', '£4.99', '£5.49'];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  // Use actual store count from database
  const getStoreCount = (product: Product) => {
    return product.store_count || 0;
  };

  // Generate random watching count
  const generateWatchingCount = () => {
    return Math.floor(Math.random() * 50) + 10; // 10-59 watching
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

  const strengthStyle = getStrengthColor(product.strength_group);
  const price = generatePrice();
  const stores = getStoreCount(product);
  const watching = generateWatchingCount();
  const slug = generateSlug(product.name);

  // PriceRunner-style additional data
  const priceNum = parseFloat(price.replace('£', ''));
  const originalPriceNum = (priceNum * (1 + Math.random() * 0.3 + 0.1)).toFixed(2);
  const originalPrice = `£${originalPriceNum}`;
  const threePayments = `£${(priceNum / 3).toFixed(2)}`;
  const rating = (Math.random() * 0.8 + 4.2).toFixed(1);
  const storeDisplay = String(stores);

  const handleHeartClick = () => {
    if (onHeartClick) {
      onHeartClick(product.id);
    }
  };

  const handlePriceAlertClick = () => {
    if (onPriceAlertClick) {
      onPriceAlertClick(product.id);
    }
  };

  const handlePriceAlertFromHeart = () => {
    if (onPriceAlertFromHeart) {
      onPriceAlertFromHeart(product.id);
    }
    if (onSetActivePopup) {
      onSetActivePopup(null);
    }
  };

  const handleAddToListFromHeart = () => {
    if (onAddToListFromHeart) {
      onAddToListFromHeart(product.id);
    }
    if (onSetActivePopup) {
      onSetActivePopup(null);
    }
  };

  return (
    <div className="swiper-slide" style={{ 
      width: '200px',
      minWidth: '200px',
      flex: '0 0 200px',
      marginRight: '0',
      opacity: '1',
      visibility: 'visible',
      transform: 'translateX(0)'
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
             minHeight: '260px',
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
          fontWeight: '600',
          color: 'rgba(0, 0, 0, 0.9)',
          zIndex: 2,
          letterSpacing: '-0.1px',
          whiteSpace: 'nowrap',
          lineHeight: '1.4'
        }}>
          {watching}+ watching
        </div>
        
        {/* Button Group */}
        {showActions && (
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
                      onClick={handlePriceAlertClick}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={priceAlerts.has(product.id) ? "#3b82f6" : "none"} stroke={priceAlerts.has(product.id) ? "#3b82f6" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: priceAlerts.has(product.id) ? "#3b82f6" : "none", stroke: priceAlerts.has(product.id) ? "#3b82f6" : "#666" }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>

            <div className="favorite-button" style={{ position: 'relative' }}>
              <button className="wishlist-toggle" 
                      data-product-id={product.id}
                      data-nonce="0510cae8a4"
                      data-is-in-wishlist={wishlist.has(product.id)}
                      onClick={handleHeartClick}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
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
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={wishlist.has(product.id) ? "#ef4444" : "none"} stroke={wishlist.has(product.id) ? "#ef4444" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: wishlist.has(product.id) ? "#ef4444" : "none", stroke: wishlist.has(product.id) ? "#ef4444" : "#666" }}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              {/* Popup Menu for Heart */}
              {activePopup === product.id && (
                <div 
                  data-popup="true"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    padding: '8px 0',
                    minWidth: '180px',
                    zIndex: 1000,
                    border: '1px solid #e5e7eb'
                  }}>
                  <button
                    onClick={handlePriceAlertFromHeart}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Price alert
                  </button>
                  
                  <button
                    onClick={handleAddToListFromHeart}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #374151',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: wishlist.has(product.id) ? '#ef4444' : 'transparent'
                    }}>
                      {wishlist.has(product.id) && (
                        <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </div>
                    {wishlist.has(product.id) ? 'Remove from favourites' : 'Add to favourites'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <Link href={`/product/${slug}`} className="product-link" style={{ 
          position: 'relative',
          zIndex: 1,
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          pointerEvents: 'auto'
        }}>
          <div className="product-image" style={{
            width: '100%',
            paddingBottom: '90%',
            position: 'relative',
            marginBottom: '10px',
            borderRadius: '14px',
            overflow: 'hidden',
            background: '#fefefe'
          }}>
            <img 
              src={getLocalImagePath(product.image_url, product.id, product.name)} 
              alt={product.name}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '18px',
                margin: '0',
                border: 'none',
                borderRadius: '0',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="product-details" style={{
            padding: '8px 4px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            margin: '0',
            background: 'transparent',
            border: 'none'
          }}>
            {/* Title + Rating Row */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <h2 className="product-title" style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#1f2544',
                margin: '0',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                lineClamp: 2,
                WebkitBoxOrient: 'vertical',
                boxOrient: 'vertical',
                overflow: 'hidden',
                letterSpacing: '-0.2px',
                padding: '0',
                textAlign: 'left',
                flex: '1',
                minWidth: '0',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
              }}>
                {product.name}
              </h2>

              {/* Star Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0
              }}>
                <span style={{ color: '#1f2544', fontSize: '13px' }}>★</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1f2544',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  {rating}
                </span>
              </div>
            </div>

            {/* Prices Row */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#1f2544',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
              }}>
                {price}
              </span>
              <span style={{
                fontSize: '13px',
                color: '#9ca3af',
                textDecoration: 'line-through',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
              }}>
                {originalPrice}
              </span>
            </div>

            {/* Store Count Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '22px',
                height: '22px',
                padding: '0 4px',
                border: '1.5px solid #d1d5db',
                borderRadius: '50px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
              }}>
                {storeDisplay}
              </span>
              <span style={{
                fontSize: '13px',
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
};

export default ProductCard;
