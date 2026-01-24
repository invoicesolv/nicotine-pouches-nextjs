'use client';

import { useState, useEffect } from 'react';
import VendorLogo from '@/components/VendorLogo';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewFilter from '@/components/ReviewFilter';
import ReviewBalls from '@/components/ReviewBalls';
import TrustpilotRating from '@/components/TrustpilotRating';
import VendorAnalytics from '@/components/VendorAnalytics';
import { convertVendorPrice, convertVendorPrices } from '@/lib/currency-converter';

interface ProductComparisonTableProps {
  product: any;
}

export default function ProductComparisonTable({ product }: ProductComparisonTableProps) {
  const [selectedVariants, setSelectedVariants] = useState<{ [storeIndex: number]: number }>({});
  const [selectedPackSize, setSelectedPackSize] = useState<string>('1pack');
  const [visibleVendors, setVisibleVendors] = useState<Set<number>>(new Set());
  const [priceSort, setPriceSort] = useState<string>('low-high');
  const [shippingFilter, setShippingFilter] = useState<string>('fastest');
  const [reviewSort, setReviewSort] = useState<string>('reviews');

  console.log('ProductComparisonTable - Product:', product);
  console.log('ProductComparisonTable - Stores:', product?.stores);
  console.log('ProductComparisonTable - Stores length:', product?.stores?.length);

  const handlePackSizeChange = (packSize: string) => {
    setSelectedPackSize(packSize);
  };

  const handlePriceSortChange = (sort: string) => {
    setPriceSort(sort);
  };

  const handleShippingFilterChange = (filter: string) => {
    setShippingFilter(filter);
  };

  const handleReviewSortChange = (sort: string) => {
    setReviewSort(sort);
  };

  // Animate vendors in one by one
  useEffect(() => {
    console.log('useEffect - Product:', product);
    console.log('useEffect - Stores:', product?.stores);
    if (product && product.stores) {
      console.log('Setting up vendor animation for', product.stores.length, 'stores');
      setVisibleVendors(new Set()); // Reset visibility
      
      // Animate each vendor in with a delay
      product.stores.forEach((_: any, index: number) => {
        setTimeout(() => {
          console.log('Making vendor', index, 'visible');
          setVisibleVendors(prev => new Set([...Array.from(prev), index]));
        }, index * 150); // 150ms delay between each vendor
      });
    } else {
      console.log('No product or stores found');
    }
  }, [product]);

  console.log('ProductComparisonTable render - visibleVendors:', Array.from(visibleVendors));
  console.log('ProductComparisonTable render - stores length:', product?.stores?.length);
  
  return (
    <>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', margin: '10px 0' }}>
        <strong>Debug Info:</strong> Stores: {product?.stores?.length || 0}, Visible: {visibleVendors.size}
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .vendor-comparison {
            margin-bottom: 2rem !important;
          }
          .vendor-card {
            margin-bottom: 15px !important;
          }
          .vendor-info {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .vendor-details {
            margin-top: 10px !important;
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .vendor-card {
            padding: 15px !important;
          }
        }
      `}</style>

      {/* Left Column - Vendor Price Comparison */}
      <div className="vendor-comparison" style={{ flex: '1', minWidth: '0' }}>
        {/* Filter Options */}
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Filter Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '20px',
            border: '1px solid #e9ecef'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
            </svg>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#495057'
            }}>
              Filters
            </span>
          </div>
          
          {/* Price Sort Filter */}
          <select 
            id="price-sort"
            value={priceSort}
            onChange={(e) => {
              handlePriceSortChange(e.target.value);
              const select = document.getElementById('price-sort') as HTMLSelectElement;
              if (select) select.dispatchEvent(new Event('change'));
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              fontSize: '0.85rem',
              backgroundColor: '#fff',
              color: '#495057',
              cursor: 'pointer',
              fontWeight: '500',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '32px'
            }}
          >
            <option value="low-high">Lowest Price</option>
            <option value="high-low">Highest Price</option>
          </select>
          <PriceSortFilter />
          
          {/* Pack Size Filter */}
          <select 
            id="pack-size" 
            value={selectedPackSize}
            onChange={(e) => handlePackSizeChange(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              fontSize: '0.85rem',
              backgroundColor: '#fff',
              color: '#495057',
              cursor: 'pointer',
              fontWeight: '500',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '32px'
            }}
          >
            <option value="1pack">1 Pack</option>
            <option value="3pack">3 Pack</option>
            <option value="5pack">5 Pack</option>
            <option value="10pack">10 Pack</option>
            <option value="15pack">15 Pack</option>
            <option value="20pack">20 Pack</option>
            <option value="25pack">25 Pack</option>
            <option value="30pack">30 Pack</option>
            <option value="50pack">50 Pack</option>
            <option value="100pack">100 Pack</option>
          </select>
          
          {/* Shipping Filter */}
          <select 
            id="shipping-sort"
            value={shippingFilter}
            onChange={(e) => {
              handleShippingFilterChange(e.target.value);
              const select = document.getElementById('shipping-sort') as HTMLSelectElement;
              if (select) select.dispatchEvent(new Event('change'));
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              fontSize: '0.85rem',
              backgroundColor: '#fff',
              color: '#495057',
              cursor: 'pointer',
              fontWeight: '500',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '32px'
            }}
          >
            <option value="fastest">Fastest Shipping</option>
            <option value="cheapest">Cheapest Shipping</option>
            <option value="free">Free Shipping Only</option>
            <option value="all">All Vendors</option>
          </select>
          <ShippingFilter />
          
          {/* Review Filter */}
          <select 
            id="review-sort"
            value={reviewSort}
            onChange={(e) => {
              handleReviewSortChange(e.target.value);
              const select = document.getElementById('review-sort') as HTMLSelectElement;
              if (select) select.dispatchEvent(new Event('change'));
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              fontSize: '0.85rem',
              backgroundColor: '#fff',
              color: '#495057',
              cursor: 'pointer',
              fontWeight: '500',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '32px'
            }}
          >
            <option value="highest">Highest Reviews</option>
          </select>
          <ReviewFilter />
        </div>

        {/* Vendor List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
        {product.stores && product.stores.length > 0 ? product.stores.map((store: any, storeIndex: number) => {
          const selectedVariant = selectedVariants[storeIndex] || 0;
          const currentVariant = store.variants && store.variants[selectedVariant] ? store.variants[selectedVariant] : null;
          const isVisible = visibleVendors.has(storeIndex);
          
          // Debug: Log offer data for troubleshooting
          if (store.name === 'Snusifer') {
            console.log('Snusifer offer data in comparison table:', {
              offer_type: store.offer_type,
              offer_value: store.offer_value,
              offer_description: store.offer_description,
              hasOffer: !!(store.offer_type && store.offer_value),
              storeKeys: Object.keys(store)
            });
          }
          
          console.log(`Rendering Store ${storeIndex}:`, {
            name: store.name,
            variants: store.variants,
            selectedVariant,
            currentVariant,
            isVisible,
            visibleVendors: Array.from(visibleVendors)
          });
          
          const handleVariantChange = (variantIndex: number) => {
            setSelectedVariants(prev => ({
              ...prev,
              [storeIndex]: variantIndex
            }));
          };
          
          return (
            <div key={storeIndex} 
                 className="vendor-card"
                 data-vendor-id={store.vendorId}
                 data-vendor-name={store.name}
                 data-price={currentVariant?.prices['1pack']?.replace('£', '') || '0'}
                 data-store-name={store.name}
                 style={{
                   backgroundColor: '#fff',
                   borderRadius: '20px',
                   border: '1px solid #fff',
                   padding: '0',
                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
                   transition: 'all 0.2s ease',
                   opacity: isVisible ? 1 : 0,
                   transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                   cursor: 'pointer'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)';
                   e.currentTarget.style.borderColor = '#e3f2fd';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.08)';
                   e.currentTarget.style.borderColor = '#fff';
                 }}>
              
              {/* Vendor Header */}
              <div style={{
                padding: '20px 24px 16px 24px',
                borderBottom: '1px solid #f8f9fa'
              }}>
                {/* Snusifer 15% Discount Badge - Always show for Snusifer */}
                {(() => {
                  const isSnusifer = store.name === 'Snusifer' || store.vendorId === 5085 || store.vendor_id === 5085;

                  if (isSnusifer) {
                    return (
                      <div style={{
                        marginBottom: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px',
                        border: '1px solid #4caf50',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: '100%'
                      }}>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: '#2e7d32',
                          fontFamily: 'Klarna Text, sans-serif'
                        }}>
                          15% OFF
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#388e3c',
                          fontFamily: 'Klarna Text, sans-serif'
                        }}>
                          - UK Products Discount
                        </span>
                      </div>
                    );
                  }

                  // Show other vendor offers
                  const hasOffer = store.offer_type && (store.offer_value !== null && store.offer_value !== undefined && store.offer_value !== '');
                  if (store.name === 'Snusifer') {
                    console.log('Offer badge check for Snusifer:', {
                      offer_type: store.offer_type,
                      offer_value: store.offer_value,
                      hasOffer,
                      type: typeof store.offer_value
                    });
                  }
                  return hasOffer ? (
                    <div style={{
                      marginBottom: '12px',
                      padding: '8px 12px',
                      backgroundColor: store.offer_type === 'percentage_discount' ? '#e8f5e9' : '#fff3e0',
                      borderRadius: '8px',
                      border: `1px solid ${store.offer_type === 'percentage_discount' ? '#4caf50' : '#ff9800'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%'
                    }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: store.offer_type === 'percentage_discount' ? '#2e7d32' : '#e65100',
                        fontFamily: 'Klarna Text, sans-serif'
                      }}>
                        {store.offer_type === 'percentage_discount'
                          ? `${Number(store.offer_value)}% OFF`
                          : `+${Number(store.offer_value)} Extra Pouches`}
                      </span>
                      {store.offer_description && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: store.offer_type === 'percentage_discount' ? '#388e3c' : '#f57c00',
                          fontFamily: 'Klarna Text, sans-serif'
                        }}>
                          - {store.offer_description}
                        </span>
                      )}
                    </div>
                  ) : null;
                })()}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  {/* Vendor Logo and Name */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <VendorLogo logo={store.logo || ''} name={store.name} />
                    <div>
                      <h3 style={{
                        margin: '0',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#212529',
                        fontFamily: 'Klarna Text, sans-serif'
                      }}>
                        {store.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}>
                        <TrustpilotRating score={store.trustpilot_score} size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div style={{
                    textAlign: 'right'
                  }}>
                    {/* Stock Status Badge */}
                    {currentVariant?.stock_status && (
                      <div style={{
                        marginBottom: '8px',
                        display: 'inline-block'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          backgroundColor: currentVariant.stock_status === 'out_of_stock' ? '#fee2e2' :
                                         currentVariant.stock_status === 'low_stock' ? '#fef3c7' : '#d1fae5',
                          color: currentVariant.stock_status === 'out_of_stock' ? '#dc2626' :
                                 currentVariant.stock_status === 'low_stock' ? '#d97706' : '#059669'
                        }}>
                          {currentVariant.stock_status === 'out_of_stock' ? 'Out of Stock' :
                           currentVariant.stock_status === 'low_stock' ? 'Low Stock' :
                           currentVariant.stock_status === 'discontinued' ? 'Discontinued' : 'In Stock'}
                        </span>
                      </div>
                    )}

                    {/* Apply 15% discount for Snusifer (vendor ID 5085) */}
                    {(() => {
                      const isSnusifer = store.name === 'Snusifer' || store.vendorId === 5085 || store.vendor_id === 5085;
                      const rawPrice = currentVariant?.prices?.[selectedPackSize] || currentVariant?.price || store.prices?.[selectedPackSize] || store.price;

                      if (currentVariant?.stock_status === 'out_of_stock') {
                        return (
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#6b7280',
                            fontFamily: 'Klarna Text, sans-serif',
                            lineHeight: '1.2',
                            textDecoration: 'line-through',
                            opacity: 0.6
                          }}>
                            Out of Stock
                          </div>
                        );
                      }

                      if (!rawPrice || rawPrice === 'N/A' || rawPrice === '') return null;

                      // Apply currency conversion if vendor needs it
                      const vendor = store.vendor || { currency: store.currency, needs_currency_conversion: store.needs_currency_conversion };
                      const convertedPrice = convertVendorPrice(vendor, rawPrice);

                      if (isSnusifer) {
                        // Extract numeric value from price string
                        const priceMatch = convertedPrice.match(/[\d.]+/);
                        if (priceMatch) {
                          const originalPrice = parseFloat(priceMatch[0]);
                          const discountedPrice = originalPrice * 0.85; // 15% off
                          const currencySymbol = convertedPrice.replace(/[\d.\s]/g, '');

                          return (
                            <>
                              {/* Original price struck through */}
                              <div style={{
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                fontFamily: 'Klarna Text, sans-serif',
                                textDecoration: 'line-through',
                                marginBottom: '4px'
                              }}>
                                {currencySymbol}{originalPrice.toFixed(2)}
                              </div>
                              {/* Discounted price */}
                              <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#28a745',
                                fontFamily: 'Klarna Text, sans-serif',
                                lineHeight: '1.2'
                              }}>
                                {currencySymbol}{discountedPrice.toFixed(2)}
                              </div>
                            </>
                          );
                        }
                      }

                      // Default price display for non-Snusifer vendors
                      return (
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#007bff',
                          fontFamily: 'Klarna Text, sans-serif',
                          lineHeight: '1.2'
                        }}>
                          {convertedPrice}
                        </div>
                      );
                    })()}
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      marginTop: '2px'
                    }}>
                      {currentVariant?.stock_status === 'out_of_stock' ? 'Not available' :
                       (() => {
                         // Get raw price and apply currency conversion
                         const rawPrice = currentVariant?.prices?.[selectedPackSize] || store.prices?.[selectedPackSize] || '0';
                         const vendor = store.vendor || { currency: store.currency, needs_currency_conversion: store.needs_currency_conversion };
                         const convertedPriceStr = convertVendorPrice(vendor, rawPrice);
                         let packPrice = parseFloat(convertedPriceStr.replace('£', '').replace('€', '').replace('$', ''));

                         // Apply 15% discount for Snusifer
                         const isSnusifer = store.name === 'Snusifer' || store.vendorId === 5085 || store.vendor_id === 5085;
                         if (isSnusifer && packPrice > 0) {
                           packPrice = packPrice * 0.85; // Apply 15% discount
                         }

                         const freeThreshold = parseFloat(store.free_shipping_threshold || '0');
                         const shippingCost = parseFloat(store.shipping_cost || '0');

                         // Debug logging
                         console.log(`${store.name} - Pack: ${selectedPackSize}, Price: ${convertedPriceStr}, Discounted: £${packPrice.toFixed(2)}, Threshold: £${freeThreshold}, Shipping: £${shippingCost}`);

                         if (packPrice >= freeThreshold && freeThreshold > 0) {
                           return 'Free shipping';
                         } else if (shippingCost > 0) {
                           const remaining = freeThreshold - packPrice;
                           return remaining > 0 ?
                             `£${shippingCost.toFixed(2)} shipping (spend £${remaining.toFixed(2)} more for free)` :
                             `£${shippingCost.toFixed(2)} shipping`;
                         } else {
                           // Use shipping_info if available, otherwise delivery_speed, otherwise fallback
                           return store.shipping_info || store.delivery_speed || 'Contact for shipping';
                         }
                       })()}
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div style={{
                  marginBottom: '12px'
                }}>
                  <a href={currentVariant?.link || store.url || '#'}
                     style={{
                       fontSize: '0.95rem',
                       color: '#007bff',
                       textDecoration: 'none',
                       fontWeight: '500',
                       lineHeight: '1.4'
                     }}
                     target="_blank"
                     rel="noopener noreferrer"
                     onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                     onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                    {currentVariant?.name || store.name}
                  </a>
                </div>

                {/* Variant Selection */}
                {store.variants && store.variants.length > 1 && (
                  <div style={{
                    marginTop: '12px'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      Available variants:
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {store.variants.map((variant: any, variantIndex: number) => (
                        <button
                          key={variantIndex}
                          onClick={() => handleVariantChange(variantIndex)}
                          style={{
                            padding: '6px 12px',
                            border: selectedVariant === variantIndex ? '2px solid #007bff' : '1px solid #e9ecef',
                            borderRadius: '16px',
                            backgroundColor: selectedVariant === variantIndex ? '#e3f2fd' : '#fff',
                            color: selectedVariant === variantIndex ? '#007bff' : '#6c757d',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Klarna Text, sans-serif'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedVariant !== variantIndex) {
                              e.currentTarget.style.borderColor = '#007bff';
                              e.currentTarget.style.color = '#007bff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedVariant !== variantIndex) {
                              e.currentTarget.style.borderColor = '#e9ecef';
                              e.currentTarget.style.color = '#6c757d';
                            }
                          }}>
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vendor Analytics */}
              <div style={{
                padding: '0 24px 20px 24px'
              }}>
                <VendorAnalytics 
                  productId={product.id} 
                  productName={product.name}
                />
              </div>
            </div>
          );
        }) : (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6c757d'
          }}>
            <p>No comparison data available</p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
