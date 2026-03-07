'use client';

import { useState, useEffect } from 'react';
import StoreLayout from '@/components/store/StoreLayout';
import KPIGrid from '@/components/store/dashboard/KPIGrid';

interface ChartData {
  date: string;
  clicks: number;
  impressions: number;
  conversions: number;
}

interface TopProduct {
  name: string;
  clicks: number;
}

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

export default function StoreAnalyticsPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const daysParam = days === 0 ? 365 : days;
      const [overviewRes, clicksRes] = await Promise.all([
        fetch(`/api/store/analytics/overview?days=${daysParam}`, { credentials: 'include' }),
        fetch(`/api/store/analytics/clicks?days=${daysParam}`, { credentials: 'include' }),
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setKpis(overviewData.kpis);
      }

      if (clicksRes.ok) {
        const clicksData = await clicksRes.json();
        setChartData(clicksData.chartData || []);
        setTopProducts(clicksData.topProducts || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxImpressions = Math.max(...chartData.map(d => d.impressions), 1);

  return (
    <StoreLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track your store performance and engagement
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
              <option value={0}>All time</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <KPIGrid data={kpis} loading={loading} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Impressions & Clicks Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Traffic Over Time</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-200 rounded-sm" />
                  <span className="text-gray-500">Impressions</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                  <span className="text-gray-500">Clicks</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="text-gray-500">Conversions</span>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available for this period
              </div>
            ) : (
              <div className="h-64">
                {/* Stacked bar chart */}
                <div className="flex items-end h-48 gap-[2px]">
                  {chartData.slice(-60).map((data) => {
                    const impressionHeight = (data.impressions / maxImpressions) * 100;
                    const clickHeight = maxImpressions > 0 ? (data.clicks / maxImpressions) * 100 : 0;
                    return (
                      <div
                        key={data.date}
                        className="flex-1 group relative flex flex-col items-stretch justify-end h-full"
                      >
                        {/* Impressions bar (background) */}
                        <div
                          className="bg-blue-100 hover:bg-blue-200 rounded-t transition-colors relative"
                          style={{ height: `${Math.max(impressionHeight, 1)}%` }}
                        >
                          {/* Clicks overlay */}
                          {data.clicks > 0 && (
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t"
                              style={{ height: `${Math.max(clickHeight / impressionHeight * 100, 4)}%` }}
                            />
                          )}
                          {/* Conversions dot */}
                          {data.conversions > 0 && (
                            <div
                              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"
                            />
                          )}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap">
                            <div className="text-gray-400 mb-1">{new Date(data.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</div>
                            <div>{data.impressions} impressions</div>
                            <div>{data.clicks} clicks</div>
                            {data.conversions > 0 && <div className="text-green-400">{data.conversions} conversions</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {chartData.length > 0 && (
                    <>
                      <span>{new Date(chartData[Math.max(0, chartData.length - 60)].date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                      <span>{new Date(chartData[chartData.length - 1].date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Products by Clicks</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No product click data for this period
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.slice(0, 8).map((product, index) => (
                  <div key={`${product.name}-${index}`} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400 w-5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.clicks.toLocaleString()} clicks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-gray-500">No data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Impressions</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Conversions</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chartData.slice(-14).reverse().map((row) => {
                    const ctr = row.impressions > 0
                      ? ((row.clicks / row.impressions) * 100).toFixed(2)
                      : '0.00';
                    return (
                      <tr key={row.date} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(row.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                          {row.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-green-600 text-right font-medium">
                          {row.conversions > 0 ? row.conversions.toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">
                          {ctr}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Improve your performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 mb-1">Competitive pricing</div>
              <p className="text-xs text-gray-600">Products priced lowest get the top position. Check competitor prices regularly and match or beat them on your best-selling items.</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 mb-1">Stock availability</div>
              <p className="text-xs text-gray-600">Out-of-stock products still show but get pushed down. Keep your top sellers in stock to maintain visibility.</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 mb-1">Product coverage</div>
              <p className="text-xs text-gray-600">The more products you have mapped, the more comparison pages you appear on. Map all your products to maximize exposure.</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 mb-1">Shipping & offers</div>
              <p className="text-xs text-gray-600">Free shipping and bundle deals are shown on your listings. Update your shipping info and offers in Settings to stand out.</p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
