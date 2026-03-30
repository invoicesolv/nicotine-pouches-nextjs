'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getLocalImagePath } from '@/utils/imageUtils';
import { useOptionalTranslation } from '@/i18n/useOptionalTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductActionButton from './ProductActionButton';
import type { SectionProduct } from '@/lib/fetchSectionProducts';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

interface DynamicProductSectionProps {
  title: string;
  section: 'trending' | 'popular' | 'new';
  refreshInterval?: number;
  rotateCount?: number;
  initialProducts?: SectionProduct[];
}

export default function DynamicProductSection({
  title,
  section,
  initialProducts
}: DynamicProductSectionProps) {
  const dict = useOptionalTranslation();
  const { currentLanguage } = useLanguage();
  const localePrefix = currentLanguage === 'uk' ? '' : `/${currentLanguage}`;
  const products = initialProducts || [];
  const now = Date.now();

  if (products.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', marginBottom: '32px', minHeight: '320px' }}>
      {/* Section Header */}
      <div style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          fontSize: '22px',
          fontWeight: '700',
          margin: '0',
          color: '#1f2544',
          letterSpacing: '-0.3px'
        }}>
          {title}
        </h2>
      </div>

      {/* Products Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '8px',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none',
        width: '100%',
        paddingBottom: '10px'
      }}>
        {products.map((product, index) => {
          const slug = generateSlug(product.name);
          const isEULocale = currentLanguage === 'de' || currentLanguage === 'it' || currentLanguage === 'es';
          const productHref = isEULocale && (product as any).vendor_url
            ? (product as any).vendor_url
            : `${localePrefix}/product/${slug}`;
          const isExternal = isEULocale && (product as any).vendor_url;
          const isNew = product.created_at && (now - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000;

          return (
            <div
              key={`${section}-${product.id}-${index}`}
              style={{
                width: '160px',
                minWidth: '160px',
                flex: '0 0 160px'
              }}
            >
              <div style={{
                position: 'relative',
                background: 'transparent',
                borderRadius: '0',
                overflow: 'visible',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                boxShadow: 'none',
                width: '100%',
                cursor: 'pointer'
              }}>

                {/* Watching Badge */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 2
                }}>
                  <div style={{
                    background: '#e5ff7d',
                    padding: '2px 6px',
                    borderRadius: '100px',
                    fontSize: '9px',
                    fontWeight: '600',
                    color: 'rgba(0, 0, 0, 0.9)',
                    letterSpacing: '-0.1px',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.4'
                  }}>
                    {product.tracking_count > 0 ? `${product.tracking_count} ${dict?.common.tracking ?? 'tracking'}` : (dict?.common.trackPrice ?? 'Track price')}
                  </div>
                  {isNew && (
                    <div style={{
                      background: '#3b82f6',
                      padding: '2px 6px',
                      borderRadius: '100px',
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#fff',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.4',
                      textTransform: 'uppercase'
                    }}>
                      {dict?.common.new ?? 'NEW'}
                    </div>
                  )}
                </div>

                {/* Interactive Bell Button - Client Component Island */}
                <ProductActionButton product={{
                  id: product.id,
                  name: product.name,
                  brand: product.brand,
                  strength_group: product.strength_group,
                  image_url: product.image_url,
                  store_count: product.store_count
                }} />

                <Link href={isExternal ? productHref : productHref} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} style={{
                  position: 'relative',
                  zIndex: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block'
                }}>
                  <div className="product-image-container" style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    marginBottom: '6px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#fefefe'
                  }}>
                    <Image
                      src={getLocalImagePath(product.image_url, product.id, product.name)}
                      alt={product.name}
                      width={144}
                      height={144}
                      className="product-image-zoom"
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '8px',
                        boxSizing: 'border-box',
                        transition: 'transform 0.5s ease-out'
                      }}
                    />
                  </div>

                  <div style={{
                    padding: '4px 2px',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Title + Rating Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '4px',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#1f2544',
                        margin: '0',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        letterSpacing: '-0.2px',
                        flex: '1',
                        minWidth: '0',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {product.name}
                      </h3>
                      {/* Star Rating */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        flexShrink: 0
                      }}>
                        <span style={{ color: '#1f2544', fontSize: '11px' }}>★</span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#1f2544',
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                        }}>
                          {(4.2 + (product.id % 8) * 0.1).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Prices Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '4px',
                      marginBottom: '2px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1f2544',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {product.price}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        textDecoration: 'line-through',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {product.original_price || `${product.price.charAt(0)}${(parseFloat(product.price.replace(/[£$€]/g, '')) * 1.25).toFixed(2)}`}
                      </span>
                    </div>

                    {/* In Stock */}
                    <p style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      margin: '0 0 4px 0',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      {dict?.common.inStockAt ?? 'In stock at'} {product.store_count} {product.store_count === 1 ? (dict?.common.vendor ?? 'vendor') : (dict?.common.vendors ?? 'vendors')}
                    </p>

                    {/* Store Count Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 3px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '50px',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#6b7280',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {product.store_count}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                      }}>
                        {dict?.common.stores ?? 'stores'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
