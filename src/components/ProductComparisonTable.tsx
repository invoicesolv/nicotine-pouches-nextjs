'use client';

import { useState, useEffect } from 'react';
import VendorLogo from '@/components/VendorLogo';
import PackFilter from '@/components/PackFilter';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewFilter from '@/components/ReviewFilter';
import ReviewBalls from '@/components/ReviewBalls';
import VendorAnalytics from '@/components/VendorAnalytics';

interface ProductComparisonTableProps {
  product: any;
}

export default function ProductComparisonTable({ product }: ProductComparisonTableProps) {
  const [selectedVariants, setSelectedVariants] = useState<{ [storeIndex: number]: number }>({});
  const [selectedPackSize, setSelectedPackSize] = useState<string>('1pack');
  const [visibleVendors, setVisibleVendors] = useState<Set<number>>(new Set());

  const handlePackSizeChange = (packSize: string) => {
    setSelectedPackSize(packSize);
  };

  // Animate vendors in one by one
  useEffect(() => {
    if (product && product.stores) {
      setVisibleVendors(new Set()); // Reset visibility
      
      // Animate each vendor in with a delay
      product.stores.forEach((_: any, index: number) => {
        setTimeout(() => {
          setVisibleVendors(prev => new Set([...Array.from(prev), index]));
        }, index * 150); // 150ms delay between each vendor
      });
    }
  }, [product]);

  return (
    <>
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
          <PriceSortFilter />
          
          {/* Pack Size Filter */}
          <PackFilter stores={product.stores} onPackSizeChange={handlePackSizeChange} />
          
          {/* Shipping Filter */}
          <ShippingFilter />
          
          {/* Review Filter */}
          <ReviewFilter />
        </div>

        {/* Vendor List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
        {product.stores.map((store: any, storeIndex: number) => {
          const selectedVariant = selectedVariants[storeIndex] || 0;
          const currentVariant = store.variants[selectedVariant];
          const isVisible = visibleVendors.has(storeIndex);
          
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
                        <ReviewBalls rating={store.rating || 4.0} />
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#6c757d',
                          fontWeight: '500'
                        }}>
                          {store.rating || 4.0}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#007bff',
                      fontFamily: 'Klarna Text, sans-serif',
                      lineHeight: '1.2'
                    }}>
                      £{currentVariant?.prices?.[selectedPackSize] || currentVariant?.price || 'N/A'}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      marginTop: '2px'
                    }}>
                      {currentVariant?.shipping || 'Free shipping'}
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div style={{
                  marginBottom: '12px'
                }}>
                  <a href={currentVariant?.link || '#'}
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
        })}
        </div>
      </div>
    </>
  );
}