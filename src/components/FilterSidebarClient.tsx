'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterData {
  brands: { name: string; count: number }[];
  flavours: { name: string; count: number }[];
  strengths: { name: string; count: number }[];
  formats: { name: string; count: number }[];
  vendors: { name: string; count: number }[];
}

interface FilterSidebarClientProps {
  sidebarData: FilterData;
  basePath: string;
  activeFilters: {
    brand: string;
    vendor: string;
    flavour: string;
    strength: string;
    format: string;
    minPrice: string;
    maxPrice: string;
  };
  currency?: string;
}

export default function FilterSidebarClient({ sidebarData, basePath, activeFilters, currency = '£' }: FilterSidebarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [brandSearch, setBrandSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [flavourSearch, setFlavourSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllVendors, setShowAllVendors] = useState(false);
  const [showAllFlavours, setShowAllFlavours] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 when filtering
    router.push(`${basePath}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(basePath);
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '');

  const filteredBrands = sidebarData.brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const filteredVendors = sidebarData.vendors.filter(v =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );
  const filteredFlavours = sidebarData.flavours.filter(f =>
    f.name.toLowerCase().includes(flavourSearch.toLowerCase())
  );

  return (
    <div className="sidebar-mobile" style={{
      width: '280px',
      backgroundColor: '#fff',
      padding: '0',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      minHeight: '100%',
      overflowY: 'auto',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      flexShrink: 0,
      alignSelf: 'stretch'
    }}>

      {/* Active Filters / Clear All */}
      {hasActiveFilters && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f0f9ff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>
              Active Filters
            </span>
            <button
              onClick={clearAllFilters}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: '#dc2626',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear All
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeFilters.brand && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#1e40af',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {activeFilters.brand}
                <button onClick={() => updateFilter('brand', '')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  lineHeight: 1
                }}>×</button>
              </span>
            )}
            {activeFilters.vendor && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#059669',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {activeFilters.vendor}
                <button onClick={() => updateFilter('vendor', '')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  lineHeight: 1
                }}>×</button>
              </span>
            )}
            {activeFilters.flavour && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#d946ef',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {activeFilters.flavour}
                <button onClick={() => updateFilter('flavour', '')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  lineHeight: 1
                }}>×</button>
              </span>
            )}
            {activeFilters.strength && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#f59e0b',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {activeFilters.strength}
                <button onClick={() => updateFilter('strength', '')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  lineHeight: 1
                }}>×</button>
              </span>
            )}
            {activeFilters.format && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#6366f1',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {activeFilters.format}
                <button onClick={() => updateFilter('format', '')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  lineHeight: 1
                }}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Brands Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2544' }}>Brands</span>
          <span style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {sidebarData.brands.length}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          marginBottom: '10px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ marginRight: '8px' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '13px',
              color: '#374151'
            }}
          />
        </div>

        <div style={{ maxHeight: showAllBrands ? '300px' : 'auto', overflowY: showAllBrands ? 'auto' : 'visible' }}>
          {(showAllBrands || brandSearch ? filteredBrands : filteredBrands.slice(0, 8)).map((brand, index) => (
            <button
              key={index}
              onClick={() => updateFilter('brand', activeFilters.brand === brand.name ? '' : brand.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 10px',
                marginBottom: '2px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilters.brand === brand.name ? '#eff6ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: activeFilters.brand === brand.name ? '2px solid #1e40af' : '2px solid #d1d5db',
                  backgroundColor: activeFilters.brand === brand.name ? '#1e40af' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeFilters.brand === brand.name && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '13px',
                  color: activeFilters.brand === brand.name ? '#1e40af' : '#374151',
                  fontWeight: activeFilters.brand === brand.name ? '500' : '400'
                }}>
                  {brand.name}
                </span>
              </div>
              <span style={{
                fontSize: '11px',
                color: '#9ca3af',
                backgroundColor: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: '500'
              }}>
                {brand.count}
              </span>
            </button>
          ))}
        </div>

        {filteredBrands.length > 8 && !brandSearch && (
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              background: 'none',
              border: '1px dashed #d1d5db',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#1e40af',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {showAllBrands ? 'Show Less' : `Show ${filteredBrands.length - 8} More`}
          </button>
        )}
      </div>

      {/* Vendors Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2544' }}>Vendors</span>
          <span style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {sidebarData.vendors.length}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          marginBottom: '10px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ marginRight: '8px' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search vendors..."
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '13px',
              color: '#374151'
            }}
          />
        </div>

        <div style={{ maxHeight: showAllVendors ? '300px' : 'auto', overflowY: showAllVendors ? 'auto' : 'visible' }}>
          {(showAllVendors || vendorSearch ? filteredVendors : filteredVendors.slice(0, 6)).map((vendor, index) => (
            <button
              key={index}
              onClick={() => updateFilter('vendor', activeFilters.vendor === vendor.name ? '' : vendor.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 10px',
                marginBottom: '2px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilters.vendor === vendor.name ? '#ecfdf5' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: activeFilters.vendor === vendor.name ? '2px solid #059669' : '2px solid #d1d5db',
                  backgroundColor: activeFilters.vendor === vendor.name ? '#059669' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeFilters.vendor === vendor.name && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '13px',
                  color: activeFilters.vendor === vendor.name ? '#059669' : '#374151',
                  fontWeight: activeFilters.vendor === vendor.name ? '500' : '400'
                }}>
                  {vendor.name}
                </span>
              </div>
              <span style={{
                fontSize: '11px',
                color: '#9ca3af',
                backgroundColor: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: '500'
              }}>
                {vendor.count}
              </span>
            </button>
          ))}
        </div>

        {filteredVendors.length > 6 && !vendorSearch && (
          <button
            onClick={() => setShowAllVendors(!showAllVendors)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              background: 'none',
              border: '1px dashed #d1d5db',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#059669',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {showAllVendors ? 'Show Less' : `Show ${filteredVendors.length - 6} More`}
          </button>
        )}
      </div>

      {/* Flavours Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2544' }}>Flavours</span>
          <span style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {sidebarData.flavours.length}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          marginBottom: '10px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ marginRight: '8px' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search flavours..."
            value={flavourSearch}
            onChange={(e) => setFlavourSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '13px',
              color: '#374151'
            }}
          />
        </div>

        <div style={{ maxHeight: showAllFlavours ? '300px' : 'auto', overflowY: showAllFlavours ? 'auto' : 'visible' }}>
          {(showAllFlavours || flavourSearch ? filteredFlavours : filteredFlavours.slice(0, 6)).map((flavour, index) => (
            <button
              key={index}
              onClick={() => updateFilter('flavour', activeFilters.flavour === flavour.name ? '' : flavour.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 10px',
                marginBottom: '2px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilters.flavour === flavour.name ? '#fdf4ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: activeFilters.flavour === flavour.name ? '2px solid #d946ef' : '2px solid #d1d5db',
                  backgroundColor: activeFilters.flavour === flavour.name ? '#d946ef' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeFilters.flavour === flavour.name && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '13px',
                  color: activeFilters.flavour === flavour.name ? '#d946ef' : '#374151',
                  fontWeight: activeFilters.flavour === flavour.name ? '500' : '400'
                }}>
                  {flavour.name}
                </span>
              </div>
              <span style={{
                fontSize: '11px',
                color: '#9ca3af',
                backgroundColor: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: '500'
              }}>
                {flavour.count}
              </span>
            </button>
          ))}
        </div>

        {filteredFlavours.length > 6 && !flavourSearch && (
          <button
            onClick={() => setShowAllFlavours(!showAllFlavours)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              background: 'none',
              border: '1px dashed #d1d5db',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#d946ef',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {showAllFlavours ? 'Show Less' : `Show ${filteredFlavours.length - 6} More`}
          </button>
        )}
      </div>

      {/* Strength Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2544' }}>Strength</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sidebarData.strengths.map((strength, index) => {
            const colors: Record<string, { bg: string; border: string; text: string }> = {
              'Normal': { bg: '#ecfdf5', border: '#059669', text: '#059669' },
              'Strong': { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' },
              'Extra Strong': { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' }
            };
            const color = colors[strength.name] || colors['Normal'];
            const isActive = activeFilters.strength === strength.name;

            return (
              <button
                key={index}
                onClick={() => updateFilter('strength', isActive ? '' : strength.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isActive ? `2px solid ${color.border}` : '1px solid #e5e7eb',
                  backgroundColor: isActive ? color.bg : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color.border
                  }} />
                  <span style={{
                    fontSize: '13px',
                    color: isActive ? color.text : '#374151',
                    fontWeight: isActive ? '600' : '400'
                  }}>
                    {strength.name}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  backgroundColor: '#f3f4f6',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}>
                  {strength.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2544' }}>Format</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sidebarData.formats.map((format, index) => {
            const isActive = activeFilters.format === format.name;
            return (
              <button
                key={index}
                onClick={() => updateFilter('format', isActive ? '' : format.name)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isActive ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  backgroundColor: isActive ? '#eef2ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#6366f1' : '#374151'
                }}
              >
                {format.name} ({format.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Section */}
      <div style={{ padding: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2544' }}>Price</span>
        </div>

        <PriceRangeSlider
          min={0}
          max={15}
          priceDistribution={[65, 90, 78, 45, 30, 20, 15, 10, 5, 3]}
          onChange={(min, max) => {
            const params = new URLSearchParams(searchParams.toString());
            if (min > 0) params.set('minPrice', min.toString());
            else params.delete('minPrice');
            if (max < 15) params.set('maxPrice', max.toString());
            else params.delete('maxPrice');
            params.delete('page');
            router.push(`${basePath}?${params.toString()}`);
          }}
          presetRanges={[
            { label: `Up to ${currency}3`, min: 0, max: 3, count: 45 },
            { label: `${currency}3 - ${currency}5`, min: 3, max: 5, count: 78 },
            { label: `${currency}5 - ${currency}8`, min: 5, max: 8, count: 92 },
            { label: `At least ${currency}8`, min: 8, max: 15, count: 34 }
          ]}
        />
      </div>
    </div>
  );
}
