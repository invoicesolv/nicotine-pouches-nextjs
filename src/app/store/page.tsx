'use client';

import { useState, useEffect } from 'react';
import StoreLayout from '@/components/store/StoreLayout';
import KPIGrid from '@/components/store/dashboard/KPIGrid';
import { useStoreAuth } from '@/contexts/StoreAuthContext';

interface KPIData {
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  clickThroughRate: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  mappedProducts: number;
  unmappedProducts: number;
  lastUpdated: string | null;
}

export default function StoreDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const { vendor } = useStoreAuth();

  useEffect(() => {
    fetchKPIs();
  }, [days]);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/store/analytics/overview?days=${days}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setKpis(data.kpis);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back{vendor?.name ? `, ${vendor.name}` : ''}
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Period:</span>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* KPI Grid */}
        <KPIGrid data={kpis} loading={loading} />

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/store/products"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Products</h3>
                <p className="text-sm text-gray-500">Manage your product listings</p>
              </div>
            </div>
          </a>

          <a
            href="/store/mappings"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Product Mappings</h3>
                <p className="text-sm text-gray-500">See how products are matched</p>
              </div>
            </div>
          </a>

          <a
            href="/store/analytics"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-500">Detailed performance metrics</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </StoreLayout>
  );
}
