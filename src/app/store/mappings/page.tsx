'use client';

import { useState, useEffect, useCallback } from 'react';
import StoreLayout from '@/components/store/StoreLayout';

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

interface MasterProduct {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Mapping {
  id: string;
  vendorProduct: string;
  productId: string | null;
  masterProduct: MasterProduct | null;
  status: 'mapped' | 'unmapped';
  createdAt: string;
}

interface Stats {
  totalMappings: number;
  totalVendorProducts: number;
  mapped: number;
  unmapped: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function StoreMappingsPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchMappings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/store/mappings?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMappings(data.mappings);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMappings();
  };

  return (
    <StoreLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Mappings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            See how your products are matched to our master catalog
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Total Products</p>
            <p className="text-xl font-bold text-gray-900">{stats?.totalVendorProducts || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Total Mappings</p>
            <p className="text-xl font-bold text-gray-900">{stats?.totalMappings || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Mapped</p>
            <p className="text-xl font-bold text-green-600">{stats?.mapped || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Unmapped</p>
            <p className="text-xl font-bold text-orange-600">{stats?.unmapped || 0}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Mappings Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading mappings...</p>
            </div>
          ) : mappings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No mappings found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      Mapped To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mappings.map((mapping) => (
                    <tr key={mapping.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 truncate">
                            {mapping.vendorProduct}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {mapping.masterProduct ? (
                          <a
                            href={`https://nicotine-pouches.org/product/${generateSlug(mapping.masterProduct.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 max-w-md group"
                          >
                            {mapping.masterProduct.imageUrl && (
                              <img
                                src={mapping.masterProduct.imageUrl}
                                alt={mapping.masterProduct.name}
                                className="w-10 h-10 object-contain rounded"
                              />
                            )}
                            <p className="font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline truncate">
                              {mapping.masterProduct.name}
                            </p>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Not mapped</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mapping.status === 'mapped' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mapped
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Unmapped
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} mappings
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">About Product Mappings</h4>
              <p className="text-sm text-blue-700 mt-1">
                Product mappings connect your store products to our master catalog.
                This enables features like price comparison, product tracking, and analytics.
                Unmapped products are reviewed and matched regularly by our team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
