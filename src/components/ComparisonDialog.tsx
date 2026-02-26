'use client';

import { useState, useMemo } from 'react';
import VendorLogo from './VendorLogo';
import TrustpilotRating from './TrustpilotRating';

interface ComparisonDialogProps {
  product: any;
  buttonStyle?: 'default' | 'inline';
}

export default function ComparisonDialog({ product, buttonStyle = 'default' }: ComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Set<number>>(new Set());

  // Helper function to parse price to number
  const parsePriceToNumber = (price: any): number => {
    if (!price) return Infinity;
    const priceStr = price.toString().replace(/[£€$]/g, '').replace(/,/g, '').trim();
    const num = parseFloat(priceStr);
    return isNaN(num) || num <= 0 ? Infinity : num;
  };

  // Sort stores by price (lowest first)
  const sortedStores = useMemo(() => {
    if (!product?.stores) return [];
    return [...product.stores].sort((a, b) => {
      const priceA = parsePriceToNumber(a.price || a.variants?.[0]?.prices?.['1pack']);
      const priceB = parsePriceToNumber(b.price || b.variants?.[0]?.prices?.['1pack']);
      return priceA - priceB;
    });
  }, [product?.stores]);

  const toggleStore = (index: number) => {
    const newExpanded = new Set(expandedStores);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStores(newExpanded);
  };

  const defaultButtonStyle = {
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '25px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  };

  const inlineButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0',
    color: '#1f2544',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
  };

  const triggerButton = buttonStyle === 'inline' ? (
    <button style={inlineButtonStyle as React.CSSProperties} onClick={() => setOpen(true)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      Compare
    </button>
  ) : (
    <button style={defaultButtonStyle as React.CSSProperties} onClick={() => setOpen(true)}>
      Compare prices
    </button>
  );

  if (!open) {
    return triggerButton;
  }

  return (
    <>
      {triggerButton}

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
      />

      {/* Modal - positioned below header */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95%',
          maxWidth: '900px',
          maxHeight: 'calc(100vh - 100px)',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#111827',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: 0
            }}>
              Compare prices
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '4px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: 0
            }}>
              {product?.name || 'Product'}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px 24px'
        }}>
          {sortedStores && sortedStores.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {sortedStores.map((store: any, storeIndex: number) => {
                const currentVariant = store.variants?.[0] || store;
                const price = store.price || currentVariant?.prices?.['1pack'];
                const isExpanded = expandedStores.has(storeIndex);

                return (
                  <div
                    key={storeIndex}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Offer Badge */}
                    {store.offer_type && store.offer_value && String(store.offer_value).trim() !== '' && (
                      <div style={{
                        backgroundColor: '#ecfdf5',
                        padding: '8px 16px',
                        borderBottom: '1px solid #d1fae5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#059669',
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>
                          {store.offer_type === 'percentage_discount'
                            ? `${Number(store.offer_value)}% OFF`
                            : `+${Number(store.offer_value)} Extra Pouches`}
                        </span>
                        {store.offer_description && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#10b981',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}>
                            — {store.offer_description}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Top Row - Vendor Info */}
                    <div
                      onClick={() => toggleStore(storeIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        gap: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        position: 'relative'
                      }}
                    >
                      {/* Chevron */}
                      <div style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: '#9ca3af'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>

                      {/* Vendor Logo */}
                      <VendorLogo
                        logo={store.logo}
                        name={store.name}
                        size={40}
                      />

                      {/* Vendor Name */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#111827',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}>
                            {store.name}
                          </span>
                          {getRecommendedPriority(store.name) < 999 && (
                            <span style={{
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}>
                              Recommended
                            </span>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px'
                        }}>
                          <TrustpilotRating score={store.trustpilot_score} size={14} />
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#111827',
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>
                          {price || 'N/A'}
                        </div>
                        {storeIndex === 0 && (
                          <div style={{
                            fontSize: '0.65rem',
                            color: '#059669',
                            fontWeight: '600',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}>
                            Lowest price
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row - Product Details */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      gap: '12px'
                    }}>
                      {/* Product Name */}
                      <div style={{ flex: 1 }}>
                        <a
                          href={currentVariant?.link || store.url || '#'}
                          target="_blank"
                          rel="nofollow"
                          style={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            textDecoration: 'none',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}
                        >
                          {currentVariant?.product || store.name}
                        </a>
                      </div>

                      {/* Shipping */}
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                        {(() => {
                          const shippingCost = typeof store.shipping_cost === 'string'
                            ? parseFloat(store.shipping_cost) || 0
                            : (store.shipping_cost || 0);

                          if (shippingCost === 0) {
                            return <span style={{ color: '#059669' }}>Free shipping</span>;
                          }
                          return `£${shippingCost.toFixed(2)} shipping`;
                        })()}
                      </div>

                      {/* View Deal Button */}
                      <a
                        href={currentVariant?.link || store.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        style={{
                          backgroundColor: '#111827',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                      >
                        View deal
                      </a>
                    </div>

                    {/* Expanded Content - Variants */}
                    {isExpanded && store.variants && store.variants.length > 1 && (
                      <div style={{
                        borderTop: '1px solid #f3f4f6',
                        padding: '12px 16px',
                        paddingLeft: '56px',
                        backgroundColor: '#fafafa'
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '8px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>
                          All variants
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {store.variants.map((variant: any, vIndex: number) => (
                            <a
                              key={vIndex}
                              href={variant.link || store.url || '#'}
                              target="_blank"
                              rel="nofollow"
                              style={{
                                padding: '4px 10px',
                                backgroundColor: vIndex === 0 ? '#111827' : '#fff',
                                color: vIndex === 0 ? '#fff' : '#374151',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '500',
                                textDecoration: 'none',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                              }}
                            >
                              {variant.strength || variant.name || 'Standard'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b7280'
            }}>
              <p>No comparison data available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
