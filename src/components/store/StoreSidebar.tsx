'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { useState, useEffect, useRef } from 'react';

interface VendorOption {
  id: string;
  name: string;
  country: string;
  logo_url: string | null;
  claimed: boolean;
}

const navItems = [
  {
    href: '/store',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/store/products',
    label: 'Products',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/store/mappings',
    label: 'Mappings',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    href: '/store/rankings',
    label: 'Rankings',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ),
  },
  {
    href: '/store/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/store/utm-links',
    label: 'UTM Links',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
  },
  {
    href: '/store/team',
    label: 'Team',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/store/billing',
    label: 'Billing',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: '/store/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function StoreSidebar() {
  const pathname = usePathname();
  const { vendor, logout, isSuperAdmin, isImpersonating, switchVendor, stopImpersonating } = useStoreAuth();
  const [expanded, setExpanded] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [switching, setSwitching] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Fetch vendor list when switcher opens
  useEffect(() => {
    if (showSwitcher && vendors.length === 0) {
      fetch('/api/store/admin/vendors', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setVendors(data.vendors || []))
        .catch(() => {});
    }
  }, [showSwitcher, vendors.length]);

  // Close switcher on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
        setVendorSearch('');
      }
    };
    if (showSwitcher) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSwitcher]);

  const handleSwitch = async (vendorId: string) => {
    setSwitching(true);
    await switchVendor(vendorId);
    setSwitching(false);
    setShowSwitcher(false);
    setVendorSearch('');
  };

  const handleStopImpersonating = async () => {
    setSwitching(true);
    await stopImpersonating();
    setSwitching(false);
  };

  const filteredVendors = vendorSearch
    ? vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
    : vendors;

  return (
    <aside
      className={`${expanded ? 'w-52' : 'w-[56px]'} bg-white border-r border-gray-200 min-h-screen flex flex-col py-4 flex-shrink-0 transition-all duration-200`}
    >
      {/* Impersonation banner */}
      {isImpersonating && (
        <div className={`${expanded ? 'mx-3 mb-2 px-2 py-1.5' : 'mx-2 mb-2 py-1'} bg-amber-50 border border-amber-200 rounded-lg text-center`}>
          {expanded ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700">Viewing as</span>
              <button
                onClick={handleStopImpersonating}
                disabled={switching}
                className="text-xs font-medium text-amber-800 hover:text-amber-900 underline"
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={handleStopImpersonating}
              disabled={switching}
              className="w-5 h-5 mx-auto flex items-center justify-center"
              title="Stop impersonating"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
          )}
        </div>
      )}

      {/* Top: Logo + Vendor name (clickable for super admin) */}
      <div className={`relative flex items-center ${expanded ? 'px-4 gap-3' : 'justify-center'} mb-4`} ref={switcherRef}>
        <button
          onClick={() => {
            if (isSuperAdmin) {
              setExpanded(true);
              setShowSwitcher(!showSwitcher);
            }
          }}
          className={`flex-shrink-0 ${isSuperAdmin ? 'cursor-pointer' : ''}`}
          title={isSuperAdmin ? 'Switch vendor' : vendor?.name}
        >
          {vendor?.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.name}
              className={`w-8 h-8 object-contain rounded ${isSuperAdmin ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
            />
          ) : (
            <div className={`w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm font-bold ${isSuperAdmin ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}>
              {vendor?.name?.[0] || 'S'}
            </div>
          )}
        </button>
        {expanded && (
          <button
            onClick={() => isSuperAdmin && setShowSwitcher(!showSwitcher)}
            className={`flex-1 min-w-0 text-left ${isSuperAdmin ? 'cursor-pointer' : ''}`}
          >
            <span className="text-sm font-semibold text-gray-900 truncate block">
              {vendor?.name || 'Store'}
            </span>
            {isSuperAdmin && (
              <span className="text-[10px] text-blue-500 font-medium">Switch vendor</span>
            )}
          </button>
        )}

        {/* Vendor switcher dropdown */}
        {showSwitcher && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                autoFocus
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredVendors.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleSwitch(v.id)}
                  disabled={switching || v.id === vendor?.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                    v.id === vendor?.id ? 'bg-gray-50 text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {v.logo_url ? (
                    <img src={v.logo_url} alt={v.name} className="w-6 h-6 object-contain rounded" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {v.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{v.name}</div>
                    <div className="text-[10px] text-gray-400">
                      {v.country === 'us' ? 'US' : 'UK'}
                      {!v.claimed && ' — unclaimed'}
                    </div>
                  </div>
                  {v.id === vendor?.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
              {filteredVendors.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">No vendors found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expand/collapse button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`${expanded ? 'mx-3' : 'mx-auto'} mb-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors`}
      >
        <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Divider */}
      <div className={`${expanded ? 'mx-4' : 'mx-3'} h-px bg-gray-200 mb-3`} />

      {/* Navigation */}
      <nav className={`flex-1 flex flex-col gap-0.5 ${expanded ? 'px-3' : 'items-center px-2'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/store' && pathname.startsWith(item.href));

          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg transition-colors ${
                  expanded ? 'px-3 py-2' : 'w-9 h-9 justify-center'
                } ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {item.icon}
                {expanded && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
              {/* Tooltip (collapsed only) */}
              {!expanded && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs font-medium rounded px-2 py-1 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className={`${expanded ? 'mx-4' : 'mx-3'} h-px bg-gray-200 my-3`} />

      {/* Logout */}
      <div className={`relative group ${expanded ? 'px-3' : 'flex justify-center px-2'}`}>
        <button
          onClick={logout}
          className={`flex items-center gap-3 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors ${
            expanded ? 'px-3 py-2 w-full' : 'w-9 h-9 justify-center'
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {expanded && <span className="text-sm font-medium">Logout</span>}
        </button>
        {!expanded && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-gray-900 text-white text-xs font-medium rounded px-2 py-1 whitespace-nowrap">
              Logout
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
