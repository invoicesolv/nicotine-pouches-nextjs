'use client';

import { useState, useEffect } from 'react';
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
}

const PriceAlertModal = ({ isOpen, onClose, product, userId, onAlertCreated }: PriceAlertModalProps) => {
  const [alertType, setAlertType] = useState<'price_drop' | 'target_price'>('price_drop');
  const [minPriceReduction, setMinPriceReduction] = useState(1);
  const [targetPrice, setTargetPrice] = useState('');
  const [targetPackSize, setTargetPackSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorPrices, setVendorPrices] = useState<any[]>([]);

  const fetchVendorPrices = async () => {
    try {
      const response = await fetch(`/api/vendor-prices?productId=${product?.id}`);
      const data = await response.json();
      if (data.success) {
        setVendorPrices(data.prices);
      }
    } catch (error) {
      console.error('Error fetching vendor prices:', error);
    }
  };

  // Fetch real vendor prices when modal opens
  useEffect(() => {
    if (isOpen && product) {
      fetchVendorPrices();
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Generate random price (since we don't have price data in the product)
  const generatePrice = () => {
    const prices = ['£2.99', '£3.49', '£3.99', '£4.49', '£4.99', '£5.49'];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  const productPrice = generatePrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        setError(error.message);
        return;
      }

      onAlertCreated?.();
      onClose();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error creating price alert:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
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
              {productPrice}
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
