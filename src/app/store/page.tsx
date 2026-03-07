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

interface TrendData {
  totalClicks: number | null;
  totalImpressions: number | null;
  totalConversions: number | null;
  clickThroughRate: number | null;
  mappedProducts: number | null;
  inStockProducts: number | null;
  totalProducts: number | null;
  outOfStockProducts: number | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function StoreDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
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
        setTrends(data.trends || null);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getGreeting()}{vendor?.name ? `, ${vendor.name}` : ''}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here&apos;s what&apos;s happening today
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* KPI Grid */}
        <KPIGrid data={kpis} trends={trends} loading={loading} />

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/store/products"
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors group flex items-center gap-3"
          >
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Products</h3>
              <p className="text-xs text-gray-400">Manage listings</p>
            </div>
          </a>

          <a
            href="/store/mappings"
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors group flex items-center gap-3"
          >
            <div className="p-2 bg-purple-50 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Mappings</h3>
              <p className="text-xs text-gray-400">Product matching</p>
            </div>
          </a>

          <a
            href="/store/analytics"
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors group flex items-center gap-3"
          >
            <div className="p-2 bg-green-50 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Analytics</h3>
              <p className="text-xs text-gray-400">Performance metrics</p>
            </div>
          </a>
        </div>
      </div>
    </StoreLayout>
  );
}
