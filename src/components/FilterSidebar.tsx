'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  brands: string[];
  flavours: string[];
  strengths: string[];
  formats: string[];
  vendors: string[];
  priceRange: { min: number; max: number } | null;
}

const FilterSidebar = ({ onFiltersChange }: FilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    batteryLife: true,
    price: true,
    inventory: true,
    vendors: true,
    rating: false,
    sale: false
  });

  const [filterData, setFilterData] = useState<{
    brands: { name: string; count: number }[];
    flavours: { name: string; count: number }[];
    strengths: { name: string; count: number }[];
    formats: { name: string; count: number }[];
    vendors: { name: string; count: number }[];
  }>({
    brands: [],
    flavours: [],
    strengths: [],
    formats: [],
    vendors: []
  });

  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const shouldEmitChanges = useRef(false);
  
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    brands: [],
    flavours: [],
    strengths: [],
    formats: [],
    vendors: [],
    priceRange: null
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        
        // Fetch products with actual brand and flavour columns
        const { data: productData } = await supabase()
          .from('wp_products')
          .select('name, brand, flavour')
          .not('name', 'is', null);
        
        // Use actual brand column with fallback to name parsing
        const brandCounts = (productData || []).reduce((acc: Record<string, number>, item: any) => {
          const brand = item.brand || item.name.split(' ')[0]; // Fallback to name parsing
          if (brand && brand.trim()) {
            acc[brand] = (acc[brand] || 0) + 1;
          }
          return acc;
        }, {});
        
        const brands = Object.entries(brandCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        // Use actual flavour column with fallback to name parsing
        const flavourCounts = (productData || []).reduce((acc: Record<string, number>, item: any) => {
          const flavour = item.flavour || item.name.split(' ').slice(1).join(' '); // Fallback
          if (flavour && flavour.trim()) {
            acc[flavour] = (acc[flavour] || 0) + 1;
          }
          return acc;
        }, {});
        
        const flavours = Object.entries(flavourCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        // Use default strengths since wp_products doesn't have strength data
        const strengths = [
          { name: 'Normal', count: Math.floor(productData?.length * 0.4) || 0 },
          { name: 'Strong', count: Math.floor(productData?.length * 0.3) || 0 },
          { name: 'Extra Strong', count: Math.floor(productData?.length * 0.3) || 0 }
        ];

        // Use default formats since wp_products doesn't have format data
        const formats = [
          { name: 'Slim', count: Math.floor(productData?.length * 0.6) || 0 },
          { name: 'Mini', count: Math.floor(productData?.length * 0.2) || 0 },
          { name: 'White', count: Math.floor(productData?.length * 0.2) || 0 }
        ];

        // Fetch unique vendors with counts - optimized approach
        const { data: vendorData } = await supabase()
          .from('vendors')
          .select('name, id')
          .eq('is_active', true);
        
        // Get all vendor-product mappings at once
        const { data: allMappings } = await supabase()
          .from('vendor_product_mapping')
          .select('vendor_id');
        
        // Count products per vendor
        const vendorCounts: Record<string, number> = {};
        if (vendorData && allMappings) {
          const mappingCounts = allMappings.reduce((acc: Record<string, number>, mapping: any) => {
            acc[mapping.vendor_id] = (acc[mapping.vendor_id] || 0) + 1;
            return acc;
          }, {});
          
          vendorData.forEach((vendor: any) => {
            vendorCounts[vendor.name] = mappingCounts[vendor.id] || 0;
          });
        }
        
        const vendors = Object.entries(vendorCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        console.log('Filter data loaded:', {
          brands: brands.slice(0, 5),
          flavours: flavours.slice(0, 5),
          strengths: strengths.slice(0, 5),
          formats: formats.slice(0, 5),
          vendors: vendors.slice(0, 5)
        });
        
        setFilterData({
          brands,
          flavours,
          strengths,
          formats,
          vendors: vendors.length > 0 ? vendors : [{ name: 'No vendors found', count: 0 }]
        });
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
        shouldEmitChanges.current = true;
      }
    };

    fetchFilterData().catch((error) => {
      console.error('Unhandled error in fetchFilterData:', error);
    });
  }, []);

  // Emit filter changes after initialization
  useEffect(() => {
    if (shouldEmitChanges.current) {
      try {
        onFiltersChange?.(selectedFilters);
      } catch (error) {
        console.error('Error in onFiltersChange callback:', error);
      }
    }
  }, [selectedFilters, onFiltersChange]);

  // Don't emit initial state - let the parent handle empty filters

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
      console.log('Filter change:', filterType, value, checked);
      
      return newFilters;
    });
  };

  const handleStrengthChange = (value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev, strengths: [value] };
      console.log('Strength change:', value, newFilters);
      
      return newFilters;
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev, priceRange: { min, max } };
      console.log('Price range change:', min, max, newFilters);
      
      return newFilters;
    });
  };

  const powerSourceOptions = filterData.brands.length > 0 ? filterData.brands : [
    { name: '4NX', count: 8 },
    { name: '77', count: 25 },
    { name: 'Ace', count: 15 },
    { name: 'Ace X', count: 3 },
    { name: 'Ace Xmas Edition', count: 1 },
    { name: 'Apres', count: 8 },
    { name: 'Arctic7', count: 3 },
    { name: 'Avant', count: 6 },
    { name: 'BAGZ', count: 9 },
    { name: 'BAOW', count: 1 },
    { name: 'BLOW', count: 3 },
    { name: 'Camo', count: 5 },
    { name: 'Chainpop', count: 6 },
    { name: 'Chapo', count: 2 },
    { name: 'Clew', count: 7 },
    { name: 'Coco', count: 7 },
    { name: 'Crown', count: 2 },
    { name: 'Cuba', count: 20 },
    { name: 'ELF', count: 5 },
    { name: 'ELUX', count: 9 },
    { name: 'Eos', count: 3 },
    { name: 'FEDRS', count: 7 },
    { name: 'FUMi', count: 8 },
    { name: 'Fix', count: 7 },
    { name: 'Frokens', count: 4 },
    { name: 'Garant', count: 1 },
    { name: 'GOAT', count: 6 },
    { name: 'Helwit', count: 15 },
    { name: 'Hit', count: 5 },
    { name: 'Ice', count: 9 },
    { name: 'Ice Reaper', count: 1 },
    { name: 'Iceberg', count: 30 },
    { name: 'Kelly White', count: 6 },
    { name: 'KILLA', count: 30 },
    { name: 'Klar', count: 2 },
    { name: 'Klint', count: 16 },
    { name: 'Kurwa', count: 30 },
    { name: 'Level', count: 10 },
    { name: 'Lips', count: 2 },
    { name: 'Loop', count: 10 },
    { name: 'Lundgrens', count: 9 },
    { name: 'Lyft', count: 7 },
    { name: 'Lynx', count: 3 },
    { name: 'Maggie', count: 4 },
    { name: 'Miami', count: 9 },
    { name: 'Morko', count: 1 },
    { name: 'Niccos', count: 6 },
    { name: 'Noat', count: 4 },
    { name: 'Nois', count: 12 },
    { name: 'Noise', count: 1 },
    { name: 'Nordic Spirit', count: 20 },
    { name: 'On!', count: 10 },
    { name: 'Pablo', count: 20 },
    { name: 'Poke', count: 6 },
    { name: 'Rabbit', count: 8 },
    { name: 'Rave', count: 12 },
    { name: 'Rush', count: 9 },
    { name: 'Siberia', count: 1 },
    { name: 'Skruf', count: 9 },
    { name: 'Snatch', count: 4 },
    { name: 'Stellar', count: 8 },
    { name: 'Stripe', count: 5 },
    { name: 'STNG', count: 6 },
    { name: 'TACJA', count: 8 },
    { name: 'Thunder', count: 3 },
    { name: 'UBBS', count: 8 },
    { name: 'V&YOU', count: 9 },
    { name: 'Velo', count: 20 },
    { name: 'ViD', count: 20 },
    { name: 'Volt', count: 15 },
    { name: 'White Fox', count: 5 },
    { name: 'XO', count: 7 },
    { name: 'XQS', count: 20 },
    { name: 'ZYN', count: 10 }
  ];

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

  const features = filterData.flavours.length > 0 ? filterData.flavours : [
    { name: 'Mint', count: 45 },
    { name: 'Berry', count: 32 },
    { name: 'Citrus', count: 28 },
    { name: 'Tropical', count: 25 },
    { name: 'Apple', count: 22 },
    { name: 'Cherry', count: 18 }
  ];

  const batteryLifeRanges = filterData.strengths.length > 0 ? filterData.strengths : [
    { name: 'Light (1-3mg)', count: 45 },
    { name: 'Normal (4-6mg)', count: 78 },
    { name: 'Strong (7-12mg)', count: 92 },
    { name: 'Extra Strong (13mg+)', count: 34 }
  ];


  const filteredBrands = powerSourceOptions.filter(brand => 
    brand.name.toLowerCase().includes(searchTerms.brands.toLowerCase())
  );
  const displayedBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 8);

  const filteredFeatures = features.filter(feature => 
    feature.name.toLowerCase().includes(searchTerms.features.toLowerCase())
  );
  const displayedFlavours = showAllFlavours ? filteredFeatures : filteredFeatures.slice(0, 6);

  const filteredBatteryLife = batteryLifeRanges.filter(range => 
    range.name.toLowerCase().includes(searchTerms.batteryLife.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{
        width: '280px',
        backgroundColor: '#fff',
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading filters...</div>
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
      
      {/* Power Source Section */}
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

      {/* Vendors Section */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div 
          onClick={() => toggleSection('vendors')}
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
          <span>Vendors</span>
          <span style={{ 
            fontSize: '14px',
            transform: expandedSections.vendors ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▲
          </span>
        </div>
        
        {expandedSections.vendors && (
          <div style={{ marginTop: '8px' }}>
            {filterData.vendors.map(vendor => (
              <label key={vendor.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.vendors.includes(vendor.name)}
                    onChange={(e) => handleFilterChange('vendors', vendor.name, e.target.checked)}
                    style={{
                      marginRight: '8px',
                      accentColor: '#1e40af'
                    }}
                  />
                  <span>{vendor.name}</span>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {vendor.count}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
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

      {/* Battery Life Section */}
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
            
            {/* Predefined Ranges */}
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
          <div style={{ marginTop: '12px', padding: '0 12px' }}>
            <PriceRangeSlider
              min={0}
              max={15}
              priceDistribution={[65, 90, 78, 45, 30, 20, 15, 10, 5, 3]}
              onChange={(min, max) => handlePriceRangeChange(min, max)}
              presetRanges={[
                { label: 'Up to £3', min: 0, max: 3, count: 45 },
                { label: '£3 - £5', min: 3, max: 5, count: 78 },
                { label: '£5 - £8', min: 5, max: 8, count: 92 },
                { label: 'At least £8', min: 8, max: 15, count: 34 }
              ]}
            />
          </div>
        )}
      </div>

      {/* Inventory Status Section */}
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
            {(filterData.formats.length > 0 ? filterData.formats : [
              { name: 'Slim', count: 249 },
              { name: 'Mini', count: 45 },
              { name: 'Regular', count: 12 }
            ]).map(format => (
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

export default FilterSidebar;
