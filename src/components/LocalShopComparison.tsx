'use client';

import { useState } from 'react';

interface ShopData {
  name: string;
  logo: string;
  priceRange: string;
  avgPrice: string;
  brands: number;
  products: number;
  delivery: string;
  features: string[];
  color: string;
}

interface LocalShopComparisonProps {
  cityName: string;
}

const SHOP_DATA: ShopData[] = [
  {
    name: 'Tesco',
    logo: '/shop-logos/tesco-logo.svg',
    priceRange: '£4.00 - £8.00',
    avgPrice: '£6.50',
    brands: 49,
    products: 860,
    delivery: 'Delivery to your Door',
    features: ['Multi-Buy Discounts', 'Clubcard Points', 'Click & Collect'],
    color: 'bg-blue-50 border-blue-200'
  },
  {
    name: 'Corner Shop',
    logo: '/shop-logos/corner-shop-logo.svg',
    priceRange: '£5.50 - £9.50',
    avgPrice: '£7.50',
    brands: 3,
    products: 10,
    delivery: 'Walk-in Only',
    features: ['Convenient Location', 'Quick Purchase', 'Local Service'],
    color: 'bg-green-50 border-green-200'
  },
  {
    name: 'Nicotine Pouches UK',
    logo: '/cropped-NP-1.png',
    priceRange: '£2.50 - £6.50',
    avgPrice: '£4.50',
    brands: 15,
    products: 200,
    delivery: 'Free UK Delivery',
    features: ['Best Prices', 'Free Delivery', 'Price Comparison'],
    color: 'bg-purple-50 border-purple-200'
  }
];

export default function LocalShopComparison({ cityName }: LocalShopComparisonProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compare Local Shops in {cityName}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find the best prices and availability for nicotine pouches from local retailers in {cityName}. 
            Compare prices, brands, and delivery options to get the best deal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {SHOP_DATA.map((shop, index) => (
            <div
              key={shop.name}
              className={`${shop.color} rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                selectedShop === shop.name ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setSelectedShop(selectedShop === shop.name ? null : shop.name)}
            >
              <div className="text-center mb-4">
                <div className="mb-2 flex justify-center">
                  <img 
                    src={shop.logo} 
                    alt={`${shop.name} logo`}
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                <p className="text-sm text-gray-600">{shop.delivery}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Price Range:</span>
                  <span className="text-sm font-bold text-gray-900">{shop.priceRange}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Average Price:</span>
                  <span className="text-lg font-bold text-green-600">{shop.avgPrice}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Brands:</span>
                  <span className="text-sm font-bold text-gray-900">{shop.brands}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Products:</span>
                  <span className="text-sm font-bold text-gray-900">{shop.products}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {shop.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Comparison</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brands
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {SHOP_DATA.map((shop, index) => (
                  <tr key={shop.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={shop.logo} 
                          alt={`${shop.name} logo`}
                          className="h-8 w-auto object-contain mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                          <div className="text-sm text-gray-500">{shop.delivery}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.priceRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">{shop.avgPrice}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.brands}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shop.delivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Local Tips */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Local Shopping Tips for {cityName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Times to Shop:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Early morning for fresh stock</li>
                <li>• Weekdays for better availability</li>
                <li>• Avoid peak hours (5-7 PM)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Money-Saving Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look for multi-buy offers</li>
                <li>• Check for loyalty card discounts</li>
                <li>• Compare prices online first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
