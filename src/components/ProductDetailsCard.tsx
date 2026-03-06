import React from 'react';

interface ProductDetailsCardProps {
  product: {
    name: string;
    brand: string;
    flavour: string;
    flavour_category?: string;
    strength_group?: string;
    format?: string;
    description?: string;
    description_long?: string;
    headline?: string;
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

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let key = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join(' ').trim();
        if (content) {
          elements.push(
            <p key={key++} style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.7', margin: '0 0 16px 0' }}>
              {content}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={key++} style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0B051D', margin: '32px 0 12px 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {trimmed.replace(/^## /, '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={key++} style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0B051D', margin: '24px 0 8px 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {trimmed.replace(/^### /, '')}
          </h3>
        );
      } else if (trimmed === '') {
        flushParagraph();
      } else if (trimmed.startsWith('- **')) {
        flushParagraph();
        const match = trimmed.match(/^- \*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
        if (match) {
          elements.push(
            <div key={key++} style={{ display: 'flex', gap: '8px', padding: '8px 0', fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
              <span style={{ color: '#9ca3af' }}>•</span>
              <span><strong style={{ color: '#1f2544' }}>{match[1]}</strong> — {match[2]}</span>
            </div>
          );
        } else {
          const boldMatch = trimmed.match(/^- \*\*(.+?)\*\*(.*)$/);
          if (boldMatch) {
            elements.push(
              <div key={key++} style={{ display: 'flex', gap: '8px', padding: '8px 0', fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
                <span style={{ color: '#9ca3af' }}>•</span>
                <span><strong style={{ color: '#1f2544' }}>{boldMatch[1]}</strong>{boldMatch[2]}</span>
              </div>
            );
          }
        }
      } else if (trimmed.startsWith('- ')) {
        flushParagraph();
        elements.push(
          <div key={key++} style={{ display: 'flex', gap: '8px', padding: '6px 0', fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
            <span style={{ color: '#9ca3af' }}>•</span>
            <span>{trimmed.replace(/^- /, '')}</span>
          </div>
        );
      } else {
        currentParagraph.push(trimmed);
      }
    }
    flushParagraph();
    return elements;
  };

  const priceRange = calculatePriceRange();

  const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid #e5e7eb'
    }}>
      <span style={{
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '14px',
        color: '#1f2544',
        fontWeight: '600'
      }}>
        {value}
      </span>
    </div>
  );

  return (
    <div style={{
      background: 'transparent',
      padding: '0',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {/* Details List */}
      <div>
        <DetailRow label="Brand" value={product.brand} />
        <DetailRow label="Flavour" value={product.flavour_category && product.flavour_category !== 'default' ? product.flavour_category.charAt(0).toUpperCase() + product.flavour_category.slice(1) : product.flavour} />
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

      {/* Description - render markdown for long description, plain text fallback */}
      {(product.description_long || product.description) && cleanDescription(product.description_long || product.description || '') && (
        <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', marginTop: '4px' }}>
          {product.description_long && product.description_long.includes('##') ? (
            <div>{renderMarkdown(product.description_long)}</div>
          ) : (
            <>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Description
              </div>
              <p style={{
                fontSize: '15px',
                color: '#4b5563',
                lineHeight: '1.7',
                margin: 0
              }}>
                {cleanDescription(product.description_long || product.description || '')}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsCard;
