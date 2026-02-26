'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUSBrandLogo } from '@/lib/brand-logos';
import BrandSearchBar from '@/components/BrandSearchBar';
import styles from './brands.module.css';

interface Brand {
  name: string;
  slug: string;
}

interface BrandsGridProps {
  brands: Brand[];
}

export default function BrandsGrid({ brands }: BrandsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) {
      return brands;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  return (
    <>
      <BrandSearchBar onSearch={setSearchQuery} placeholder="Search brands..." />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {filteredBrands.map((brand) => {
          const brandLogo = getUSBrandLogo(brand.name);
          
          return (
            <Link 
              key={brand.slug} 
              href={`/us/brand/${brand.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
              }}
              className={styles.brandCard}
              >
                {brandLogo ? (
                <Image
                  src={brandLogo}
                  alt={`${brand.name} logo`}
                  width={150}
                  height={150}
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    height: 'auto',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                  unoptimized
                />
                ) : (
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {brand.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      {filteredBrands.length === 0 && searchQuery && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No brands found</p>
          <p style={{ fontSize: '14px' }}>Try searching for a different brand name</p>
        </div>
      )}
    </>
  );
}

