'use client';

import React, { useState, useEffect } from 'react';
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
  const [targetPackSize, setTargetPackSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorPrices, setVendorPrices] = useState<any[]>([]);
  const [fetchingPrices, setFetchingPrices] = useState(false);

  const fetchVendorPrices = async () => {
    if (fetchingPrices) return; // Prevent multiple simultaneous requests
    
    setFetchingPrices(true);
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`/api/vendor-prices?productId=${product?.id}&region=${region}`, {
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
        console.warn('API returned unsuccessful response:', data);
        // Set empty array if API fails
        setVendorPrices([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Vendor prices request timed out');
      } else {
        console.error('Error fetching vendor prices:', error);
      }
      // Set empty array on error so modal can still work
      setVendorPrices([]);
    } finally {
      setFetchingPrices(false);
    }
  };

  // Fetch real vendor prices when modal opens
  useEffect(() => {
    if (isOpen && product && product.id) {
      // Add a small delay to ensure modal is fully mounted
      const timer = setTimeout(() => {
        fetchVendorPrices();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      // Reset state when modal closes
      setVendorPrices([]);
      setFetchingPrices(false);
    }
  }, [isOpen, product?.id]);

  // Get the lowest price from vendor data, or use a default
  const productPrice = React.useMemo(() => {
    if (vendorPrices.length > 0) {
      const lowestPrice = Math.min(...vendorPrices.map(v => parseFloat(v.pack_price)));
      return `£${lowestPrice.toFixed(2)}`;
    }
    // Fallback to a default price if no vendor data
    return '£3.99';
  }, [vendorPrices]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First check if a price alert already exists for this user, product, and alert type
      const { data: existingAlert, error: checkError } = await supabase()
        .from('price_alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .eq('alert_type', alertType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw checkError;
      }

      if (existingAlert) {
        setError('You already have a price alert set for this product with this alert type. Please update your existing alert instead.');
        return;
      }

      const alertData = {
        user_id: userId,
        product_id: product.id,
        alert_type: alertType,
        min_price_reduction: alertType === 'price_drop' ? minPriceReduction : null,
        target_price: alertType === 'target_price' ? parseFloat(targetPrice) : null,
        pack_size: alertType === 'target_price' ? targetPackSize : null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase()
        .from('price_alerts')
        .insert(alertData);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('You already have a price alert set for this product with this alert type. Please update your existing alert instead.');
        } else {
          setError(error.message);
        }
        return;
      }

      onAlertCreated?.();
      onClose();
    } catch (err: any) {
      if (err.code === '23505') { // Unique constraint violation
        setError('You already have a price alert set for this product with this alert type. Please update your existing alert instead.');
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error creating price alert:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        boxSizing: 'border-box'
      }}>
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            Price alert
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Product Info */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              'No Image'
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#059669',
              margin: 0
            }}>
              {fetchingPrices ? 'Loading...' : productPrice}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              {product.brand} • {product.flavour}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Alert Type Options */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: alertType === 'price_drop' ? '#f3f4f6' : 'white'
              }}>
                <input
                  type="radio"
                  name="alertType"
                  value="price_drop"
                  checked={alertType === 'price_drop'}
                  onChange={(e) => setAlertType(e.target.value as 'price_drop')}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    Notify me when the price has dropped
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: alertType === 'target_price' ? '#f3f4f6' : 'white'
              }}>
                <input
                  type="radio"
                  name="alertType"
                  value="target_price"
                  checked={alertType === 'target_price'}
                  onChange={(e) => setAlertType(e.target.value as 'target_price')}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    Notify me when my target price has been reached
                  </div>
                </div>
              </label>
            </div>

          </div>

          {/* Price Reduction Input */}
          {alertType === 'price_drop' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Minimum price reduction per message
              </label>
              <div style={{ position: 'relative', maxWidth: '200px' }}>
                <input
                  type="number"
                  value={minPriceReduction}
                  onChange={(e) => setMinPriceReduction(parseFloat(e.target.value) || 0)}
                  min="0.01"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  £
                </span>
              </div>
            </div>
          )}

          {/* Target Price Input */}
          {alertType === 'target_price' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Pack size
                </label>
                <select
                  value={targetPackSize}
                  onChange={(e) => setTargetPackSize(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    maxWidth: '200px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value={10}>10 pouches</option>
                  <option value={20}>20 pouches</option>
                  <option value={30}>30 pouches</option>
                  <option value={40}>40 pouches</option>
                  <option value={50}>50 pouches</option>
                  <option value={100}>100 pouches</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Target price for {targetPackSize} pouches
                </label>
                <div style={{ position: 'relative', maxWidth: '200px' }}>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    £
                  </span>
                </div>
              </div>

              {/* Current Vendor Prices */}
              {vendorPrices.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Current prices from vendors:
                  </label>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {vendorPrices.map((vendor, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 0',
                        borderBottom: index < vendorPrices.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {vendor.vendor_name}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669' }}>
                          £{vendor.pack_price?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Advanced Settings */}
          <div style={{ marginBottom: '24px' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <span>Advanced settings</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (alertType === 'target_price' && !targetPrice)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading ? '#9ca3af' : '#111827',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Creating...' : 'Create price alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceAlertModal;
