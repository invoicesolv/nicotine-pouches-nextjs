import React from 'react';

interface ProductDetailsCardProps {
  product: {
    name: string;
    brand: string;
    flavour: string;
    strength_group?: string;
    format?: string;
    description?: string;
    stores: Array<{
      name: string;
      variants?: Array<{
        prices: Record<string, string>;
      }>;
      prices?: Record<string, string>; // For US stores
    }>;
  };
}

const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({ product }) => {
  const calculatePriceRange = () => {
    const prices = product.stores
      .flatMap((store) => {
        // Handle both UK (with variants) and US (without variants) data structures
        if (store.variants && store.variants.length > 0) {
          // UK structure: store has variants
          return store.variants.map((variant) => {
            const priceStr = variant.prices?.['1pack'] || 'N/A';
            if (priceStr === 'N/A') return null;
            return parseFloat(priceStr.replace(/[£$]/g, ''));
          });
        } else {
          // US structure: store has direct prices
          const priceStr = store.prices?.['1pack'] || 'N/A';
          if (priceStr === 'N/A') return null;
          return [parseFloat(priceStr.replace(/[£$]/g, ''))];
        }
      })
      .filter((price): price is number => price !== null);
    
    if (prices.length === 0) return 'N/A';
    if (prices.length === 1) {
      const currency = product.stores[0]?.prices?.['1pack']?.includes('$') ? '$' : '£';
      return `${currency}${prices[0]?.toFixed(2) || '0.00'}`;
    }
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const currency = product.stores[0]?.prices?.['1pack']?.includes('$') ? '$' : '£';
    return min === max ? `${currency}${min.toFixed(2)}` : `${currency}${min.toFixed(2)} - ${currency}${max.toFixed(2)}`;
  };

  const cleanDescription = (text: string) => {
    return text.replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim();
  };

  return (
    <div style={{
      background: 'transparent',
      borderRadius: '0',
      padding: '0',
      boxShadow: 'none',
      border: 'none',
      position: 'static',
      maxWidth: '100%'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#0f172a',
          letterSpacing: '-0.025em',
          margin: '0'
        }}>
          Product Details
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Product Name - Full Width */}
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <label style={{
            fontSize: '0.65rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: '0.25rem'
          }}>
            Product Name
          </label>
          <div style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: '#0f172a',
            lineHeight: '1.2',
            margin: '0'
          }}>
            {product.name}
          </div>
        </div>

        {/* Brand & Flavour - Side by Side */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{
            flex: '1',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{
              fontSize: '0.65rem',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Brand
            </label>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#0f172a',
              lineHeight: '1.2',
              margin: '0'
            }}>
              {product.brand}
            </div>
          </div>
          
          <div style={{
            flex: '1',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{
              fontSize: '0.65rem',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Flavour
            </label>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#0f172a',
              lineHeight: '1.2',
              margin: '0'
            }}>
              {product.flavour}
            </div>
          </div>
        </div>

        {/* Available Vendors & Price Range - Side by Side */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{
            flex: '1',
            padding: '0.75rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            border: '1px solid #bae6fd'
          }}>
            <label style={{
              fontSize: '0.65rem',
              fontWeight: '600',
              color: '#0369a1',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Available From
            </label>
            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#0c4a6e',
              lineHeight: '1.2',
              margin: '0'
            }}>
              {product.stores.length} vendor{product.stores.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div style={{
            flex: '1',
            padding: '0.75rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #bbf7d0'
          }}>
            <label style={{
              fontSize: '0.65rem',
              fontWeight: '600',
              color: '#166534',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Price Range (1 Pack)
            </label>
            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#14532d',
              lineHeight: '1.2',
              margin: '0'
            }}>
              {calculatePriceRange()}
            </div>
          </div>
        </div>

        {/* Description - Full Width */}
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fefce8',
          borderRadius: '6px',
          border: '1px solid #fde047',
          borderLeft: '3px solid #eab308'
        }}>
          <label style={{
            fontSize: '0.65rem',
            fontWeight: '600',
            color: '#a16207',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Description
          </label>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: '500',
            color: '#451a03',
            lineHeight: '1.4',
            margin: '0'
          }}>
            {cleanDescription(product.description || '')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
