'use client';

import { useState, useEffect } from 'react';
import StoreLayout from '@/components/store/StoreLayout';
import { useStoreAuth } from '@/contexts/StoreAuthContext';

interface ShippingInfo {
  shipping_info: string | null;
  delivery_speed: string | null;
  cutoff_time: string | null;
  free_shipping_threshold: string | null;
  shipping_methods: string | null;
  same_day_available: boolean;
  same_day_location: string | null;
  shipping_cost: string | null;
  offer_type: string | null;
  offer_value: string | null;
  offer_description: string | null;
  trustpilot_score: string | null;
  review_count: number | null;
  trustpilot_url: string | null;
}

interface VendorListItem {
  id: string;
  name: string;
  country: string;
  logo_url: string | null;
  claimed: boolean;
  accountEmail: string | null;
}

interface ReportPreferences {
  report_frequency: 'off' | 'daily' | 'weekly' | 'monthly';
  include_analytics: boolean;
  include_products: boolean;
  include_rankings: boolean;
  email_override: string | null;
  last_sent_at: string | null;
}

export default function StoreSettingsPage() {
  const { user, vendor, logout, switchVendor, isImpersonating, stopImpersonating } = useStoreAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [impersonating, setImpersonating] = useState(false);
  const [reportPrefs, setReportPrefs] = useState<ReportPreferences>({
    report_frequency: 'off',
    include_analytics: true,
    include_products: true,
    include_rankings: true,
    email_override: null,
    last_sent_at: null,
  });
  const [reportSaving, setReportSaving] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);

  const { isSuperAdmin: isSuperAdminCtx } = useStoreAuth();
  const isSuperAdmin = isSuperAdminCtx || user?.role === 'super_admin';

  useEffect(() => {
    fetchShipping();
    fetchReportPrefs();
  }, []);

  // Fetch vendors when we know user is super admin
  useEffect(() => {
    if (isSuperAdmin && vendors.length === 0) fetchVendors();
  }, [isSuperAdmin]);

  const fetchShipping = async () => {
    try {
      const res = await fetch('/api/store/shipping', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setShipping(data.shipping);
      }
    } catch {} finally {
      setShippingLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/store/admin/vendors', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch {}
  };

  const handleImpersonate = async (vendorId: string) => {
    setImpersonating(true);
    const success = await switchVendor(vendorId);
    if (!success) {
      alert('Failed to switch vendor');
    }
    setImpersonating(false);
  };

  const fetchReportPrefs = async () => {
    try {
      const res = await fetch('/api/store/reports/preferences', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setReportPrefs(data.preferences);
      }
    } catch {}
  };

  const saveReportPrefs = async (updates: Partial<ReportPreferences>) => {
    setReportSaving(true);
    setReportSaved(false);
    const newPrefs = { ...reportPrefs, ...updates };
    setReportPrefs(newPrefs);
    try {
      const res = await fetch('/api/store/reports/preferences', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
      if (res.ok) {
        const data = await res.json();
        setReportPrefs(data.preferences);
        setReportSaved(true);
        setTimeout(() => setReportSaved(false), 2000);
      }
    } catch {} finally {
      setReportSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <StoreLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your account and store information
          </p>
        </div>

        {/* Super Admin: Switch Store */}
        {isSuperAdmin && (
          <div className="bg-purple-50 rounded-xl border border-purple-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-purple-200 bg-purple-100">
              <h2 className="font-semibold text-purple-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Super Admin — Switch Store
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-purple-800 mb-4">
                View any vendor's store portal as if you were logged in as them.
              </p>
              {isImpersonating && (
                <button
                  onClick={() => stopImpersonating()}
                  className="mb-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to my account (Snusifer)
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {vendors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleImpersonate(v.id)}
                    disabled={impersonating || v.id === vendor?.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      vendor?.id === v.id
                        ? 'border-purple-400 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    } disabled:opacity-50`}
                  >
                    {v.logo_url ? (
                      <img src={v.logo_url} alt={v.name} className="w-8 h-8 object-contain rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                        {v.name[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{v.name}</div>
                      <div className="text-xs text-gray-500">
                        {v.country === 'us' ? 'US' : 'UK'}
                        {vendor?.id === v.id ? ' — current' : ''}
                        {!v.claimed ? ' — unclaimed' : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
              <p className="text-gray-900 capitalize">
                {user?.role?.replace('_', ' ') || 'Store Owner'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
              <p className="text-gray-900">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Store Information</h2>
          </div>
          <div className="p-6">
            {vendor ? (
              <div className="flex items-start gap-4">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.name} className="w-16 h-16 object-contain rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{vendor.name[0]}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{vendor.country === 'us' ? 'US' : 'UK'} Store</p>
                  {vendor.website_url && (
                    <a href={vendor.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                      Visit Store Website
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No store associated with this account</p>
            )}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Shipping & Delivery</h2>
            <p className="text-xs text-gray-500 mt-0.5">This information is shown to customers on your product listings</p>
          </div>
          <div className="p-6">
            {shippingLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : shipping ? (
              <div className="space-y-4">
                {shipping.shipping_info && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Shipping Info</label>
                    <p className="text-gray-900">{shipping.shipping_info}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Shipping Cost</label>
                    <p className="text-gray-900">
                      {!shipping.shipping_cost || shipping.shipping_cost === '0' ? 'Free' : `£${shipping.shipping_cost}`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Free Shipping From</label>
                    <p className="text-gray-900">
                      {!shipping.free_shipping_threshold || shipping.free_shipping_threshold === '0'
                        ? 'Always free'
                        : `£${shipping.free_shipping_threshold}`}
                    </p>
                  </div>
                  {shipping.delivery_speed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Delivery Speed</label>
                      <p className="text-gray-900">{shipping.delivery_speed}</p>
                    </div>
                  )}
                  {shipping.cutoff_time && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Order Cutoff</label>
                      <p className="text-gray-900">{shipping.cutoff_time}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Same Day Delivery</label>
                    <p className="text-gray-900">
                      {shipping.same_day_available ? `Yes${shipping.same_day_location ? ` — ${shipping.same_day_location}` : ''}` : 'No'}
                    </p>
                  </div>
                </div>
                {shipping.offer_description && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-green-800 mb-1">Active Offer</label>
                    <p className="text-green-900">{shipping.offer_description}</p>
                  </div>
                )}
                {shipping.trustpilot_score && (
                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Trustpilot</label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">{shipping.trustpilot_score}</span>
                      <span className="text-sm text-gray-500">/ 5</span>
                      {shipping.review_count && (
                        <span className="text-sm text-gray-500">({shipping.review_count} reviews)</span>
                      )}
                      {shipping.trustpilot_url && (
                        <a href={shipping.trustpilot_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline ml-2">
                          View on Trustpilot
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Contact support@nicotine-pouches.org to update your shipping details.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No shipping information available</p>
            )}
          </div>
        </div>

        {/* Report Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Email Reports</h2>
              <p className="text-xs text-gray-500 mt-0.5">Get CSV reports delivered to your inbox</p>
            </div>
            {reportSaved && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Saved</span>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <div className="grid grid-cols-4 gap-2">
                {(['off', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => saveReportPrefs({ report_frequency: freq })}
                    disabled={reportSaving}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      reportPrefs.report_frequency === freq
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    } disabled:opacity-50`}
                  >
                    {freq === 'off' ? 'Off' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {reportPrefs.report_frequency !== 'off' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include in report</label>
                  <div className="space-y-2">
                    {[
                      { key: 'include_analytics' as const, label: 'Analytics (clicks, impressions, CTR)' },
                      { key: 'include_products' as const, label: 'Product list (prices, stock status)' },
                      { key: 'include_rankings' as const, label: 'Price rankings vs competitors' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportPrefs[key]}
                          onChange={(e) => saveReportPrefs({ [key]: e.target.checked })}
                          disabled={reportSaving}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Send to (optional override)</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder={user?.email || 'your@email.com'}
                      value={reportPrefs.email_override || ''}
                      onChange={(e) => setReportPrefs(prev => ({ ...prev, email_override: e.target.value || null }))}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button
                      onClick={() => saveReportPrefs({ email_override: reportPrefs.email_override })}
                      disabled={reportSaving}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Leave blank to use your account email ({user?.email})
                  </p>
                </div>

                {reportPrefs.last_sent_at && (
                  <p className="text-xs text-gray-500">
                    Last report sent: {new Date(reportPrefs.last_sent_at).toLocaleString()}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Session */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="font-semibold text-red-900">Session</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4">
              Sign out of your account. You will need to log in again to access the store portal.
            </p>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900">Need Help?</h3>
              <p className="text-blue-700 text-sm mt-1">
                Contact our support team for any questions about your store portal.
              </p>
              <a href="mailto:support@nicotine-pouches.org" className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
