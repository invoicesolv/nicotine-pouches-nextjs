'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

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

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  userId: string;
  onAlertCreated?: () => void;
  region?: string;
}

const PriceAlertModal = ({ isOpen, onClose, product, userId, onAlertCreated, region = 'UK' }: PriceAlertModalProps) => {
  const [alertType, setAlertType] = useState<'price_drop' | 'target_price'>('price_drop');
  const [minPriceReduction, setMinPriceReduction] = useState(1);
  const [targetPrice, setTargetPrice] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [vendorPrices, setVendorPrices] = useState<any[]>([]);
  const [fetchingPrices, setFetchingPrices] = useState(false);

  const fetchVendorPrices = async () => {
    if (fetchingPrices) return;

    setFetchingPrices(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const productName = encodeURIComponent(product?.name || '');
      const response = await fetch(`/api/vendor-prices?productId=${product?.id}&productName=${productName}&region=${region}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setVendorPrices(data.prices);
      } else {
        setVendorPrices([]);
      }
    } catch (error: unknown) {
      setVendorPrices([]);
    } finally {
      setFetchingPrices(false);
    }
  };

  useEffect(() => {
    if (isOpen && product && product.id) {
      const timer = setTimeout(() => {
        fetchVendorPrices();
      }, 100);

      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setVendorPrices([]);
      setFetchingPrices(false);
      setSuccess(false);
      setError(null);
    }
  }, [isOpen, product?.id]);

  const currentPrice = React.useMemo(() => {
    if (vendorPrices.length > 0) {
      const prices = vendorPrices.map(v => parseFloat(v.pack_price) || 0).filter(p => p > 0);
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    return 3.99;
  }, [vendorPrices]);

  const thresholdPrice = currentPrice - minPriceReduction;

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: existingAlert, error: checkError } = await supabase()
        .from('price_alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .eq('alert_type', alertType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAlert) {
        setError('You already have a price alert set for this product.');
        return;
      }

      const alertData = {
        user_id: userId,
        product_id: product.id,
        alert_type: alertType,
        min_price_reduction: alertType === 'price_drop' ? minPriceReduction : null,
        target_price: alertType === 'target_price' ? parseFloat(targetPrice) : null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase()
        .from('price_alerts')
        .insert(alertData);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      onAlertCreated?.();

      // Dispatch event to notify product cards to refresh their alert status
      window.dispatchEvent(new CustomEvent('priceAlertUpdated'));

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99998
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#f5f5f7',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 99999,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Success State */}
        {success ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            backgroundColor: '#fff',
            borderRadius: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              Price alert created!
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              We'll notify you when the price changes
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              backgroundColor: '#f5f5f7',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                Price alert
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />

            {/* Content */}
            <div style={{ padding: '20px 24px' }}>
              {/* Product Card */}
              <div style={{
                backgroundColor: '#f5f5f7',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                  {/* Product Image */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>No img</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 2px 0',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      {product.name}
                    </h3>
                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      {[1,2,3,4,5].map((star) => (
                        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= 4 ? '#111827' : 'none'} stroke="#111827" strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '2px' }}>4.5</span>
                    </div>
                  </div>
                </div>

                {/* Price Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Starting price
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      £{currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Price now
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      £{currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Threshold
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      £{thresholdPrice > 0 ? thresholdPrice.toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Options */}
              <form onSubmit={handleSubmit}>
                {/* Option 1 - Price Drop */}
                <div
                  onClick={() => setAlertType('price_drop')}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    border: alertType === 'price_drop' ? '2px solid #111827' : '2px solid transparent'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: alertType === 'price_drop' ? '6px solid #111827' : '2px solid #d1d5db',
                      backgroundColor: '#fff',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      Notify me when the price has dropped
                    </span>
                  </label>

                  {/* Nested Input */}
                  {alertType === 'price_drop' && (
                    <div style={{ marginTop: '16px', marginLeft: '32px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Minimum price reduction per message
                      </div>
                      <div style={{
                        position: 'relative',
                        maxWidth: '140px'
                      }}>
                        <input
                          type="number"
                          value={minPriceReduction}
                          onChange={(e) => setMinPriceReduction(parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '12px 40px 12px 14px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '500',
                            outline: 'none',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6b7280',
                          fontSize: '15px',
                          fontWeight: '500'
                        }}>
                          £
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2 - Target Price */}
                <div
                  onClick={() => setAlertType('target_price')}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    border: alertType === 'target_price' ? '2px solid #111827' : '2px solid transparent'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: alertType === 'target_price' ? '6px solid #111827' : '2px solid #d1d5db',
                      backgroundColor: '#fff',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      Notify me when my target price has been reached
                    </span>
                  </label>

                  {/* Nested Input */}
                  {alertType === 'target_price' && (
                    <div style={{ marginTop: '16px', marginLeft: '32px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Target price
                      </div>
                      <div style={{
                        position: 'relative',
                        maxWidth: '140px'
                      }}>
                        <input
                          type="number"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '12px 40px 12px 14px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '500',
                            outline: 'none',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6b7280',
                          fontSize: '15px',
                          fontWeight: '500'
                        }}>
                          £
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Settings */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '8px 0',
                    marginBottom: showAdvanced ? '12px' : '16px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  <span>Advanced settings</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Advanced Settings Content */}
                {showAdvanced && (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    {/* Pack Size Selector */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Pack size
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[10, 20, 30, 40, 50, 100].map((size) => (
                          <button
                            key={size}
                            type="button"
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              backgroundColor: '#fff',
                              color: '#374151',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                          >
                            {size} pouches
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current Vendor Prices */}
                    {vendorPrices.length > 0 && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Current prices from vendors
                        </div>
                        <div style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          padding: '10px',
                          maxHeight: '120px',
                          overflowY: 'auto'
                        }}>
                          {vendorPrices.map((vendor, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 0',
                              borderBottom: index < vendorPrices.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }}>
                              <span style={{ fontSize: '13px', color: '#374151', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {vendor.vendor_name}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                £{parseFloat(vendor.pack_price)?.toFixed(2) || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {fetchingPrices && (
                      <div style={{ fontSize: '13px', color: '#6b7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Loading vendor prices...
                      </div>
                    )}

                    {!fetchingPrices && vendorPrices.length === 0 && (
                      <div style={{ fontSize: '13px', color: '#9ca3af', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        No vendor prices available
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '50px',
                      backgroundColor: '#fff',
                      color: '#111827',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (alertType === 'target_price' && !targetPrice)}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      border: 'none',
                      borderRadius: '50px',
                      backgroundColor: loading ? '#9ca3af' : '#111827',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                  >
                    {loading ? 'Creating...' : 'Create price alert'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PriceAlertModal;
