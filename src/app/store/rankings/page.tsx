'use client';

import { useState, useEffect } from 'react';
import StoreLayout from '@/components/store/StoreLayout';

interface Ranking {
  label: string;
  rank: number | null;
  total: number;
  value: string;
  bestValue: string | null;
  bestVendorName: string | null;
  direction: 'asc' | 'desc';
  description: string;
}

interface ProductRanking {
  productId: number;
  productName: string;
  productImage: string | null;
  productUrl: string;
  rank: number;
  total: number;
  myPrice: number;
  myInStock: boolean;
  bestPrice: number | null;
  bestVendor: string | null;
  priceDiff: number | null;
}

interface RankingsData {
  vendorName: string;
  totalVendors: number;
  rankings: Ranking[];
  productRankings: ProductRanking[];
}

function getRankColor(rank: number, total: number) {
  const pct = (rank - 1) / Math.max(total - 1, 1);
  if (pct <= 0.25) return { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' };
  if (pct <= 0.5) return { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' };
  if (pct <= 0.75) return { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' };
}

function getOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

export default function StoreRankingsPage() {
  const [data, setData] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/store/rankings', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch rankings:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Rankings</h1>
          <p className="text-gray-600 mt-1">
            See how you stack up against {data ? data.totalVendors - 1 : ''} other vendors across key metrics
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            {/* Overall summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(() => {
                  const ranked = data.rankings.filter(r => r.rank !== null);
                  const top3 = ranked.filter(r => r.rank! <= 3).length;
                  const topHalf = ranked.filter(r => r.rank! <= Math.ceil(r.total / 2)).length;
                  const avgRank = ranked.length > 0
                    ? (ranked.reduce((sum, r) => sum + r.rank!, 0) / ranked.length).toFixed(1)
                    : '-';
                  return (
                    <>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{data.totalVendors}</div>
                        <div className="text-xs text-gray-500">Total Vendors</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{top3}</div>
                        <div className="text-xs text-gray-500">Top 3 Rankings</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{topHalf}</div>
                        <div className="text-xs text-gray-500">Top Half</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">{avgRank}</div>
                        <div className="text-xs text-gray-500">Avg Rank</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Individual rankings */}
            <div className="space-y-4">
              {data.rankings.map((ranking) => {
                if (ranking.rank === null) return null;
                const colors = getRankColor(ranking.rank, ranking.total);
                const medal = getMedal(ranking.rank);
                const positionPct = ((ranking.rank - 1) / Math.max(ranking.total - 1, 1)) * 100;

                return (
                  <div key={ranking.label} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {ranking.label}
                          {medal && <span className="text-lg">{medal}</span>}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{ranking.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                        {getOrdinal(ranking.rank)} of {ranking.total}
                      </div>
                    </div>

                    {/* Position bar */}
                    <div className="relative h-3 bg-gray-100 rounded-full mb-3">
                      {/* Gradient background */}
                      <div className="absolute inset-0 rounded-full overflow-hidden flex">
                        <div className="flex-1 bg-green-200" />
                        <div className="flex-1 bg-blue-200" />
                        <div className="flex-1 bg-yellow-200" />
                        <div className="flex-1 bg-red-200" />
                      </div>
                      {/* Position marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md bg-gray-900"
                        style={{ left: `calc(${Math.min(positionPct, 97)}% - 10px)` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Your value: </span>
                        <span className="font-semibold text-gray-900">{ranking.value}</span>
                      </div>
                      {ranking.bestValue && ranking.bestVendorName && (
                        <div className="text-right">
                          <span className="text-gray-500">Best: </span>
                          <span className="font-semibold text-green-700">{ranking.bestValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Product Rankings */}
            {data.productRankings && data.productRankings.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Product Price Rankings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your price position for each product you sell vs other vendors. Lowest price = #1.
                  </p>
                </div>

                {/* Summary row */}
                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-6 text-sm">
                  {(() => {
                    const pr = data.productRankings;
                    const first = pr.filter(p => p.rank === 1).length;
                    const top3 = pr.filter(p => p.rank <= 3).length;
                    const outOfStock = pr.filter(p => !p.myInStock).length;
                    return (
                      <>
                        <div><span className="font-semibold text-green-700">{first}</span> <span className="text-gray-500">#1 cheapest</span></div>
                        <div><span className="font-semibold text-blue-700">{top3}</span> <span className="text-gray-500">top 3</span></div>
                        <div><span className="font-semibold text-gray-700">{pr.length}</span> <span className="text-gray-500">total products</span></div>
                        {outOfStock > 0 && (
                          <div><span className="font-semibold text-red-600">{outOfStock}</span> <span className="text-gray-500">out of stock</span></div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {data.productRankings.map((pr) => {
                    const colors = getRankColor(pr.rank, pr.total);
                    const medal = getMedal(pr.rank);
                    return (
                      <div key={pr.productId} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50">
                        {/* Image */}
                        {pr.productImage ? (
                          <img src={pr.productImage} alt="" className="w-10 h-10 object-contain rounded flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
                        )}

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <a
                            href={pr.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                          >
                            {pr.productName}
                          </a>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                            <span>Your price: <span className="font-semibold text-gray-900">£{pr.myPrice.toFixed(2)}</span></span>
                            {pr.bestPrice !== null && pr.bestVendor && (
                              <span>
                                Best: <span className="font-semibold text-green-700">£{pr.bestPrice.toFixed(2)}</span>
                                {pr.priceDiff !== null && pr.priceDiff > 0 && (
                                  <span className="text-red-500 ml-1">(+£{pr.priceDiff.toFixed(2)})</span>
                                )}
                              </span>
                            )}
                            {!pr.myInStock && (
                              <span className="text-red-500 font-medium">Out of stock</span>
                            )}
                          </div>
                        </div>

                        {/* Rank badge */}
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colors.bg} ${colors.text} flex-shrink-0`}>
                          {medal && <span>{medal}</span>}
                          {getOrdinal(pr.rank)}/{pr.total}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">How rankings affect your visibility</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  <strong>Price</strong> is the primary sort factor on product pages. Lowest price = top position.
                </li>
                <li>
                  <strong>Stock rate</strong> matters — out-of-stock products get pushed down in listings.
                </li>
                <li>
                  <strong>Product coverage</strong> determines how many comparison pages you appear on.
                </li>
                <li>
                  <strong>Shipping &amp; offers</strong> are shown alongside your listings and influence buyer decisions.
                </li>
                <li>
                  <strong>Trustpilot score</strong> builds trust — higher scores and more reviews help conversion.
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Failed to load rankings. Please try again.</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
