'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ShopData {
  name: string;
  logo: string;
  logoType: 'image' | 'text';
  logoBgColor: string;
  priceRange: string;
  avgPrice: string;
  brands: number;
  products: number;
  delivery: string;
  features: string[];
  accentColor: string;
  isRecommended?: boolean;
}

interface LocalShopComparisonProps {
  cityName: string;
}

const SHOP_DATA: ShopData[] = [
  {
    name: 'Tesco',
    logo: '/vendor-logos/Tesco.png',
    logoType: 'image',
    logoBgColor: '#EBF5FF',
    priceRange: '£4.00 - £8.00',
    avgPrice: '£6.50',
    brands: 49,
    products: 860,
    delivery: 'Delivery to your Door',
    features: ['Multi-Buy Discounts', 'Clubcard Points', 'Click & Collect'],
    accentColor: '#0055A5'
  },
  {
    name: 'Corner Shop',
    logo: '',
    logoType: 'text',
    logoBgColor: '#166534',
    priceRange: '£5.50 - £9.50',
    avgPrice: '£7.50',
    brands: 3,
    products: 10,
    delivery: 'Walk-in Only',
    features: ['Convenient Location', 'Quick Purchase', 'Local Service'],
    accentColor: '#166534'
  },
  {
    name: 'Nicotine Pouches UK',
    logo: '/cropped-NP-1.png',
    logoType: 'image',
    logoBgColor: '#FFF5F5',
    priceRange: '£2.50 - £6.50',
    avgPrice: '£4.50',
    brands: 15,
    products: 200,
    delivery: 'Free UK Delivery',
    features: ['Best Prices', 'Free Delivery', 'Price Comparison'],
    accentColor: '#7C3AED',
    isRecommended: true
  }
];

export default function LocalShopComparison({ cityName }: LocalShopComparisonProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section
      className="py-20"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ color: '#4338ca', fontSize: '14px', fontWeight: '600' }}>Local Price Comparison</span>
          </div>

          <h2
            className="text-4xl md:text-5xl font-bold mb-5"
            style={{
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: '1.1'
            }}
          >
            Compare Local Shops in {cityName}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: '#475569', lineHeight: '1.7' }}
          >
            Find the best prices and availability for nicotine pouches from local retailers.
            Compare prices, brands, and delivery options.
          </p>
        </div>

        {/* Shop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {SHOP_DATA.map((shop) => (
            <div
              key={shop.name}
              className="relative cursor-pointer"
              onClick={() => setSelectedShop(selectedShop === shop.name ? null : shop.name)}
              onMouseEnter={() => setHoveredCard(shop.name)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transform: hoveredCard === shop.name ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Recommended Badge */}
              {shop.isRecommended && (
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 px-4 py-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: '600', letterSpacing: '0.02em' }}>
                    Best Value
                  </span>
                </div>
              )}

              {/* Card */}
              <div
                className="relative overflow-hidden rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: selectedShop === shop.name
                    ? `2px solid ${shop.accentColor}`
                    : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: hoveredCard === shop.name
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'
                    : '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'
                }}
              >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
                    style={{
                      backgroundColor: shop.logoBgColor,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {shop.logoType === 'image' ? (
                      <Image
                        src={shop.logo}
                        alt={`${shop.name} logo`}
                        width={56}
                        height={56}
                        className="object-contain"
                        style={{ maxWidth: '56px', maxHeight: '56px' }}
                      />
                    ) : (
                      <span
                        className="text-sm font-bold text-white px-2 text-center"
                        style={{ lineHeight: '1.2' }}
                      >
                        {shop.name.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: '#0f172a' }}
                  >
                    {shop.name}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: '#64748b' }}
                  >
                    {shop.delivery}
                  </p>
                </div>

                {/* Stats Grid */}
                <div
                  className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(241, 245, 249, 0.7)' }}
                >
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Price Range</p>
                    <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{shop.priceRange}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Avg Price</p>
                    <p className="text-lg font-bold" style={{ color: '#059669' }}>{shop.avgPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Brands</p>
                    <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{shop.brands}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Products</p>
                    <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{shop.products}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-xs font-semibold mb-3" style={{ color: '#475569', letterSpacing: '0.05em' }}>
                    KEY FEATURES
                  </p>
                  <div className="space-y-2">
                    {shop.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${shop.accentColor}15` }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={shop.accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <span className="text-sm" style={{ color: '#475569' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200"
                  style={{
                    background: shop.isRecommended
                      ? `linear-gradient(135deg, ${shop.accentColor} 0%, ${shop.accentColor}dd 100%)`
                      : 'white',
                    color: shop.isRecommended ? 'white' : '#0f172a',
                    border: shop.isRecommended ? 'none' : '1px solid #e2e8f0',
                    boxShadow: shop.isRecommended
                      ? `0 4px 14px ${shop.accentColor}40`
                      : '0 1px 3px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseOver={(e) => {
                    if (!shop.isRecommended) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!shop.isRecommended) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div
          className="rounded-2xl overflow-hidden mb-16"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          <div
            className="px-8 py-5"
            style={{ borderBottom: '1px solid #e2e8f0' }}
          >
            <h3
              className="text-xl font-bold"
              style={{ color: '#0f172a' }}
            >
              Detailed Comparison
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                    Shop
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                    Price Range
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                    Avg Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                    Brands
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                    Delivery
                  </th>
                </tr>
              </thead>
              <tbody>
                {SHOP_DATA.map((shop, index) => (
                  <tr
                    key={shop.name}
                    className="cursor-pointer transition-colors duration-150"
                    style={{
                      borderBottom: index < SHOP_DATA.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: shop.isRecommended ? 'rgba(124, 58, 237, 0.04)' : 'transparent'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = shop.isRecommended ? 'rgba(124, 58, 237, 0.08)' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = shop.isRecommended ? 'rgba(124, 58, 237, 0.04)' : 'transparent'}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                          style={{
                            backgroundColor: shop.logoBgColor,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                        >
                          {shop.logoType === 'image' ? (
                            <Image
                              src={shop.logo}
                              alt={`${shop.name} logo`}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          ) : (
                            <span
                              className="text-[8px] font-bold text-white text-center leading-tight px-1"
                            >
                              {shop.name.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ color: '#0f172a' }}>{shop.name}</span>
                            {shop.isRecommended && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: '#7c3aed', color: 'white' }}
                              >
                                BEST
                              </span>
                            )}
                          </div>
                          <span className="text-sm" style={{ color: '#64748b' }}>{shop.delivery}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-medium" style={{ color: '#0f172a' }}>{shop.priceRange}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-lg font-bold" style={{ color: '#059669' }}>{shop.avgPrice}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-semibold" style={{ color: '#0f172a' }}>{shop.brands}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-semibold" style={{ color: '#0f172a' }}>{shop.products}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: shop.delivery.includes('Free') ? '#dcfce7' : '#f1f5f9',
                          color: shop.delivery.includes('Free') ? '#166534' : '#475569'
                        }}
                      >
                        {shop.delivery.includes('Free') && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        {shop.delivery}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Local Tips */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.15)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </div>
            <h3
              className="text-xl font-bold"
              style={{ color: '#0f172a' }}
            >
              Local Shopping Tips for {cityName}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Best Times to Shop
              </h4>
              <ul className="space-y-3">
                {['Early morning for fresh stock', 'Weekdays for better availability', 'Avoid peak hours (5-7 PM)'].map((tip, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span style={{ color: '#475569' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Money-Saving Tips
              </h4>
              <ul className="space-y-3">
                {['Look for multi-buy offers', 'Check for loyalty card discounts', 'Compare prices online first'].map((tip, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span style={{ color: '#475569' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
