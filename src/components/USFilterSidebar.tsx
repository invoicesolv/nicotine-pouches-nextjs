'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface USFilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  brands: string[];
  flavours: string[];
  strengths: string[];
  formats: string[];
  priceRange: { min: number; max: number } | null;
}

const USFilterSidebar = ({ onFiltersChange }: USFilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    batteryLife: true,
    price: true,
    inventory: true,
    rating: false,
    sale: false
  });

  const [filterData, setFilterData] = useState<{
    brands: { name: string; count: number }[];
    flavours: { name: string; count: number }[];
    strengths: { name: string; count: number }[];
    formats: { name: string; count: number }[];
  }>({
    brands: [],
    flavours: [],
    strengths: [],
    formats: []
  });

  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const shouldEmitChanges = useRef(false);
  
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    brands: [],
    flavours: [],
    strengths: [],
    formats: [],
    priceRange: null
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        
        // Fetch unique brands with counts from US products
        const { data: brandData } = await supabase()
          .from('us_products')
          .select('brand')
          .not('brand', 'is', null);
        
        const brandCounts = (brandData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.brand] = (acc[item.brand] || 0) + 1;
          return acc;
        }, {});
        
        const brands = Object.entries(brandCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        // Fetch unique flavours with counts from US products
        const { data: flavourData } = await supabase()
          .from('us_products')
          .select('flavour')
          .not('flavour', 'is', null);
        
        const flavourCounts = (flavourData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.flavour] = (acc[item.flavour] || 0) + 1;
          return acc;
        }, {});
        
        const flavours = Object.entries(flavourCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        // Fetch unique strengths with counts from US products
        const { data: strengthData } = await supabase()
          .from('us_products')
          .select('strength')
          .not('strength', 'is', null);
        
        const strengthCounts = (strengthData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.strength] = (acc[item.strength] || 0) + 1;
          return acc;
        }, {});
        
        const strengths = Object.entries(strengthCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        // Fetch unique formats with counts from US products
        const { data: formatData } = await supabase()
          .from('us_products')
          .select('format')
          .not('format', 'is', null);
        
        const formatCounts = (formatData || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.format] = (acc[item.format] || 0) + 1;
          return acc;
        }, {});
        
        const formats = Object.entries(formatCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        console.log('US Filter data loaded:', {
          brands: brands.slice(0, 5),
          flavours: flavours.slice(0, 5),
          strengths: strengths.slice(0, 5),
          formats: formats.slice(0, 5)
        });
        
        setFilterData({
          brands,
          flavours,
          strengths,
          formats
        });
      } catch (error) {
        console.error('Error fetching US filter data:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
        shouldEmitChanges.current = true;
      }
    };

    fetchFilterData();
  }, []);

  // Emit filter changes after initialization
  useEffect(() => {
    if (shouldEmitChanges.current) {
      onFiltersChange?.(selectedFilters);
    }
  }, [selectedFilters, onFiltersChange]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType: keyof Omit<FilterState, 'priceRange'>, value: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = checked 
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);
      
      const newFilters = { ...prev, [filterType]: newValues };
      console.log('US Filter change:', filterType, value, checked);
      
      return newFilters;
    });
  };

  const handleStrengthChange = (value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev, strengths: [value] };
      console.log('US Strength change:', value, newFilters);
      
      return newFilters;
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev, priceRange: { min, max } };
      console.log('US Price range change:', min, max, newFilters);
      
      return newFilters;
    });
  };

  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllFlavours, setShowAllFlavours] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    brands: '',
    features: '',
    batteryLife: '',
    inventory: '',
    rating: '',
    sale: ''
  });

  const filteredBrands = filterData.brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerms.brands.toLowerCase())
  );
  const displayedBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 8);

  const filteredFeatures = filterData.flavours.filter(feature => 
    feature.name.toLowerCase().includes(searchTerms.features.toLowerCase())
  );
  const displayedFlavours = showAllFlavours ? filteredFeatures : filteredFeatures.slice(0, 6);

  const filteredBatteryLife = filterData.strengths.filter(range => 
    range.name.toLowerCase().includes(searchTerms.batteryLife.toLowerCase())
  );

  // US-specific price ranges in dollars
  const priceRanges = [
    { name: 'Up to $3', count: 45 },
    { name: '$3 - $5', count: 78 },
    { name: '$5 - $8', count: 92 },
    { name: 'At least $8', count: 34 }
  ];

  if (loading) {
    return (
      <div style={{
        width: '280px',
        backgroundColor: '#fff',
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading US filters...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '280px',
      backgroundColor: '#fff',
      padding: '0',
      borderRadius: '0',
      boxShadow: 'none',
      height: 'fit-content',
      position: 'sticky',
      top: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Brands Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          textAlign: 'left',
          fontSize: '16px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '12px',
          padding: '0 12px',
          width: 'calc(100% - 24px)',
          margin: '0 auto 12px auto'
        }}>
          Brands
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          margin: '0 auto 12px auto',
          width: 'calc(100% - 24px)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Find brand"
            value={searchTerms.brands}
            onChange={(e) => setSearchTerms(prev => ({ ...prev, brands: e.target.value }))}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '14px',
              color: '#333'
            }}
          />
        </div>
        
        {displayedBrands.map(option => (
          <label key={option.name} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#333'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={selectedFilters.brands.includes(option.name)}
                onChange={(e) => handleFilterChange('brands', option.name, e.target.checked)}
                style={{ 
                  margin: '0',
                  width: '16px',
                  height: '16px',
                  accentColor: '#1e40af'
                }}
              />
              <span>{option.name}</span>
            </div>
            <span style={{ 
              fontSize: '12px', 
              color: '#666',
              fontWeight: '500'
            }}>
              {option.count}
            </span>
          </label>
        ))}
        
        {!showAllBrands && filteredBrands.length > 8 && (
          <div style={{
            marginTop: '8px',
            fontSize: '14px',
            color: '#1e40af',
            cursor: 'pointer',
            textDecoration: 'underline',
            textAlign: 'left',
            padding: '8px 12px',
            margin: '8px auto 0 auto',
            width: 'calc(100% - 24px)'
          }} onClick={() => setShowAllBrands(true)}>
            Show all {filteredBrands.length} brands
          </div>
        )}
        
        {showAllBrands && (
          <div style={{
            marginTop: '8px',
            fontSize: '14px',
            color: '#1e40af',
            cursor: 'pointer',
            textDecoration: 'underline',
            textAlign: 'left',
            padding: '8px 12px',
            margin: '8px auto 0 auto',
            width: 'calc(100% - 24px)'
          }} onClick={() => setShowAllBrands(false)}>
            Show less
          </div>
        )}
      </div>

      {/* Flavours Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div 
          onClick={() => toggleSection('features')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            position: 'relative'
          }}
        >
          <span>Flavours</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.features ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▲
          </span>
        </div>
        
        {expandedSections.features && (
          <div style={{ marginTop: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 24px)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Find flavour"
                value={searchTerms.features}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, features: e.target.value }))}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '14px',
                  color: '#333'
                }}
              />
            </div>
            
            {displayedFlavours.map(feature => (
              <label key={feature.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                margin: '0 auto',
                width: 'calc(100% - 24px)',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.flavours.includes(feature.name)}
                    onChange={(e) => handleFilterChange('flavours', feature.name, e.target.checked)}
                    style={{ 
                      margin: '0',
                      width: '16px',
                      height: '16px',
                      accentColor: '#1e40af'
                    }}
                  />
                  <span>{feature.name}</span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {feature.count}
                </span>
              </label>
            ))}

            {!showAllFlavours && filteredFeatures.length > 6 && (
              <div style={{
                marginTop: '8px',
                fontSize: '14px',
                color: '#1e40af',
                cursor: 'pointer',
                textDecoration: 'underline',
                textAlign: 'left',
                padding: '8px 12px',
                margin: '8px auto 0 auto',
                width: 'calc(100% - 24px)'
              }} onClick={() => setShowAllFlavours(true)}>
                Show all {filteredFeatures.length} flavours
              </div>
            )}

            {showAllFlavours && (
              <div style={{
                marginTop: '8px',
                fontSize: '14px',
                color: '#1e40af',
                cursor: 'pointer',
                textDecoration: 'underline',
                textAlign: 'left',
                padding: '8px 12px',
                margin: '8px auto 0 auto',
                width: 'calc(100% - 24px)'
              }} onClick={() => setShowAllFlavours(false)}>
                Show less
              </div>
            )}
          </div>
        )}
      </div>

      {/* Strength Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div 
          onClick={() => toggleSection('batteryLife')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            position: 'relative'
          }}
        >
          <span>Strength</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.batteryLife ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▲
          </span>
        </div>
        
        {expandedSections.batteryLife && (
          <div style={{ marginTop: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 24px)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Find strength"
                value={searchTerms.batteryLife}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, batteryLife: e.target.value }))}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '14px',
                  color: '#333'
                }}
              />
            </div>
            
            {filteredBatteryLife.map(range => (
              <label key={range.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                margin: '0 auto',
                width: 'calc(100% - 24px)',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="batteryLife"
                    checked={selectedFilters.strengths.includes(range.name)}
                    onChange={() => handleStrengthChange(range.name)}
                    style={{ 
                      margin: '0',
                      width: '16px',
                      height: '16px',
                      accentColor: '#1e40af'
                    }}
                  />
                  <span>{range.name}</span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {range.count}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div 
          onClick={() => toggleSection('price')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            position: 'relative'
          }}
        >
          <span>Price</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.price ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▲
          </span>
        </div>
        
        {expandedSections.price && (
          <div style={{ marginTop: '12px' }}>
            {/* Range Slider with Histogram */}
            <div style={{ marginBottom: '16px', width: 'calc(100% - 24px)', margin: '0 auto 16px auto' }}>
              <div style={{
                height: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '10px',
                position: 'relative',
                marginBottom: '8px'
              }}>
                {/* Histogram bars */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  right: '0',
                  height: '4px',
                  backgroundColor: '#d1d5db',
                  borderRadius: '2px',
                  transform: 'translateY(-50%)'
                }} />
                {/* Histogram bars representing price distribution */}
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: '10%',
                  width: '8px',
                  height: '16px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '20%',
                  width: '8px',
                  height: '12px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: '30%',
                  width: '8px',
                  height: '16px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '40%',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '50%',
                  width: '8px',
                  height: '4px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '60%',
                  width: '8px',
                  height: '0px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '70%',
                  width: '8px',
                  height: '0px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '80%',
                  width: '8px',
                  height: '0px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '90%',
                  width: '8px',
                  height: '0px',
                  backgroundColor: '#1e40af',
                  borderRadius: '1px'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#666'
              }}>
                <span>$0</span>
                <span>$15</span>
              </div>
            </div>
            
            {/* Price Input Fields */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              width: 'calc(100% - 24px)',
              margin: '0 auto 16px auto'
            }}>
              <input
                type="number"
                placeholder="Min"
                style={{
                  width: '60px',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#666' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                style={{
                  width: '60px',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {/* Predefined Price Ranges */}
            {priceRanges.map(range => (
              <label key={range.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                margin: '0 auto',
                width: 'calc(100% - 24px)',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="price"
                    style={{ 
                      margin: '0',
                      width: '16px',
                      height: '16px',
                      accentColor: '#1e40af'
                    }}
                  />
                  <span>{range.name}</span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {range.count}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Format Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div 
          onClick={() => toggleSection('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            position: 'relative'
          }}
        >
          <span>Format</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.inventory ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▲
          </span>
        </div>
        
        {expandedSections.inventory && (
          <div style={{ marginTop: '12px' }}>
            {filterData.formats.map(format => (
              <label key={format.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                margin: '0 auto',
                width: 'calc(100% - 24px)',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.formats.includes(format.name)}
                    onChange={(e) => handleFilterChange('formats', format.name, e.target.checked)}
                    style={{ 
                      margin: '0',
                      width: '16px',
                      height: '16px',
                      accentColor: '#1e40af'
                    }}
                  />
                  <span>{format.name}</span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {format.count}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div 
          onClick={() => toggleSection('rating')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            position: 'relative'
          }}
        >
          <span>Rating</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.rating ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Sale Section */}
      <div style={{ padding: '20px 0' }}>
        <div 
          onClick={() => toggleSection('sale')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            margin: '0 auto',
            width: 'calc(100% - 24px)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            position: 'relative'
          }}
        >
          <span>On Sale</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.sale ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>

    </div>
  );
};

export default USFilterSidebar;
