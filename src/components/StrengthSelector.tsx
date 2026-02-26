'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface StrengthSelectorProps {
  product: any;
  onStrengthChange?: (strength: string | null) => void;
  isUS?: boolean;
}

interface StrengthOption {
  strength: string;
  lowestPrice: number;
  priceDisplay: string;
  imageUrl: string;
  variantCount: number;
}

export default function StrengthSelector({ product, onStrengthChange, isUS = false }: StrengthSelectorProps) {
  const [selectedStrength, setSelectedStrength] = useState<string | null>(null);
  const currencySymbol = isUS ? '$' : '£';

  // Collect all unique strengths from all stores' variants
  const strengthOptions = useMemo(() => {
    const strengthMap = new Map<string, StrengthOption>();

    product.stores?.forEach((store: any) => {
      store.variants?.forEach((variant: any) => {
        const strength = variant.strength || 'Standard';
        const priceStr = variant.prices?.['1pack'] || store.prices?.['1pack'] || '0';
        const price = parseFloat(priceStr.toString().replace(/[£$]/g, '')) || 0;

        if (price > 0) {
          const existing = strengthMap.get(strength);
          if (!existing || price < existing.lowestPrice) {
            strengthMap.set(strength, {
              strength,
              lowestPrice: price,
              priceDisplay: `${currencySymbol}${price.toFixed(2)}`,
              imageUrl: product.image_url || product.image || '/placeholder.png',
              variantCount: (existing?.variantCount || 0) + 1
            });
          } else {
            existing.variantCount += 1;
          }
        }
      });
    });

    // Convert to array and sort by strength order
    const strengthOrder: { [key: string]: number } = {
      'Mini': 1,
      'Normal': 2,
      'Standard': 3,
      'Strong': 4,
      'Extra Strong': 5,
      'Max': 6,
      'Ultra': 7
    };

    return Array.from(strengthMap.values()).sort((a, b) => {
      // First try to sort by predefined order
      const aOrder = strengthOrder[a.strength] || 100;
      const bOrder = strengthOrder[b.strength] || 100;
      if (aOrder !== bOrder) return aOrder - bOrder;

      // Then sort by mg value if present
      const aMg = parseFloat(a.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
      const bMg = parseFloat(b.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
      return aMg - bMg;
    });
  }, [product]);

  // Don't render if there's only one strength option
  if (strengthOptions.length <= 1) {
    return null;
  }

  const handleStrengthSelect = (strength: string) => {
    const newStrength = selectedStrength === strength ? null : strength;
    setSelectedStrength(newStrength);
    onStrengthChange?.(newStrength);

    // Dispatch event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('strengthChange', { detail: { strength: newStrength } }));
    }
  };

  return (
    <div style={{
      marginBottom: '24px',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {/* Strength Header */}
      <h3 style={{
        fontSize: '16px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '12px'
      }}>
        Strength
      </h3>

      {/* Card Grid */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {strengthOptions.map((option) => {
          const isSelected = selectedStrength === option.strength;

          return (
            <button
              key={option.strength}
              onClick={() => handleStrengthSelect(option.strength)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #1f2544' : '1px solid #e5e7eb',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: '100px'
              }}
            >
              {/* Product Image */}
              <div style={{
                width: '60px',
                height: '60px',
                position: 'relative',
                marginBottom: '8px'
              }}>
                <Image
                  src={option.imageUrl}
                  alt={option.strength}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="60px"
                />
              </div>

              {/* Strength Name */}
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                {option.strength}
              </span>

              {/* Price */}
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#059669'
              }}>
                {option.priceDisplay}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
