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
      prices?: Record<string, string>;
    }>;
  };
}

const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({ product }) => {
  const calculatePriceRange = () => {
    const prices = product.stores
      .flatMap((store) => {
        if (store.variants && store.variants.length > 0) {
          return store.variants.map((variant) => {
            const priceStr = variant.prices?.['1pack'];
            if (!priceStr || priceStr === '' || priceStr === 'N/A' || priceStr === null) return null;
            const num = parseFloat(priceStr.replace(/[£$]/g, ''));
            return isNaN(num) || num <= 0 ? null : num;
          });
        } else {
          const priceStr = store.prices?.['1pack'];
          if (!priceStr || priceStr === '' || priceStr === 'N/A' || priceStr === null) return null;
          const num = parseFloat(priceStr.replace(/[£$]/g, ''));
          return isNaN(num) || num <= 0 ? null : [num];
        }
      })
      .filter((price): price is number => price !== null);

    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const currency = product.stores[0]?.prices?.['1pack']?.includes('$') ? '$' : '£';
    return min === max ? `${currency}${min.toFixed(2)}` : `${currency}${min.toFixed(2)} - ${currency}${max.toFixed(2)}`;
  };

  const cleanDescription = (text: string) => {
    return text.replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim();
  };

  const priceRange = calculatePriceRange();

  const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: isLast ? 'none' : '1px solid #f3f4f6'
    }}>
      <span style={{
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '12px',
        color: '#1f2544',
        fontWeight: '600'
      }}>
        {value}
      </span>
    </div>
  );

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {/* Header */}
      <h3 style={{
        fontSize: '13px',
        fontWeight: '700',
        color: '#1f2544',
        margin: '0 0 2px 0',
        letterSpacing: '-0.2px'
      }}>
        Product Details
      </h3>

      {/* Details List */}
      <div>
        <DetailRow label="Brand" value={product.brand} />
        <DetailRow label="Flavour" value={product.flavour} />
        {product.strength_group && (
          <DetailRow label="Strength" value={product.strength_group} />
        )}
        {product.format && (
          <DetailRow label="Format" value={product.format} />
        )}
        <DetailRow
          label="Available From"
          value={`${product.stores.length} vendor${product.stores.length !== 1 ? 's' : ''}`}
          isLast={!priceRange}
        />
        {priceRange && (
          <DetailRow label="Price (1 Pack)" value={priceRange} isLast />
        )}
      </div>

      {/* Description */}
      {product.description && cleanDescription(product.description) && (
        <div style={{ paddingTop: '8px' }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Description
          </div>
          <p style={{
            fontSize: '12px',
            color: '#4b5563',
            lineHeight: '1.5',
            margin: 0
          }}>
            {cleanDescription(product.description)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsCard;
