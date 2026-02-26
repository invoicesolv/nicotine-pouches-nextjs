'use client';

import Link from 'next/link';
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

interface PriceAlert {
  id: number;
  product_id: number;
  alert_type: string;
  min_price_reduction?: number;
  target_price?: number;
  pack_size?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  products?: Product;
}

interface DashboardAlertCardProps {
  alert: PriceAlert;
  onRemove: (alertId: number) => void;
}

const DashboardAlertCard = ({ alert, onRemove }: DashboardAlertCardProps) => {
  const product = alert.products;

  if (!product) return null;

  // Generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const slug = generateSlug(product.name);

  return (
    <div style={{
      width: '100%',
      background: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header with alert type and remove button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #f3f4f6',
        background: '#fafafa'
      }}>
        <span style={{
          background: alert.alert_type === 'price_drop' ? '#dbeafe' : '#dcfce7',
          color: alert.alert_type === 'price_drop' ? '#1d4ed8' : '#166534',
          padding: '4px 10px',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.01em'
        }}>
          {alert.alert_type === 'price_drop' ? 'Price Drop Alert' : 'Target Price Alert'}
        </span>

        <button
          onClick={() => onRemove(alert.id)}
          style={{
            width: '24px',
            height: '24px',
            background: '#fee2e2',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
          title="Remove alert"
        >
          <svg width="12" height="12" fill="#dc2626" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Product content */}
      <Link href={`/product/${slug}`} style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        {/* Product image */}
        <div style={{
          width: '100%',
          paddingBottom: '80%',
          position: 'relative',
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
              padding: '16px'
            }}
          />
        </div>

        {/* Product info */}
        <div style={{
          padding: '12px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1f2544',
            margin: '0',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
          }}>
            {product.name}
          </h3>

          {/* Store count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '20px',
              height: '20px',
              padding: '0 4px',
              border: '1.5px solid #d1d5db',
              borderRadius: '50px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280'
            }}>
              {product.store_count || 0}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#6b7280'
            }}>
              stores
            </span>
          </div>
        </div>
      </Link>

      {/* Alert details footer */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #f3f4f6',
        background: '#f9fafb'
      }}>
        {alert.alert_type === 'target_price' && alert.target_price && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Target price:</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                £{alert.target_price}
              </span>
            </div>
            {alert.pack_size && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Pack size:</span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                  {alert.pack_size}
                </span>
              </div>
            )}
          </div>
        )}
        {alert.alert_type === 'price_drop' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Notify when price drops by:</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1d4ed8' }}>
              £{alert.min_price_reduction}+
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAlertCard;
