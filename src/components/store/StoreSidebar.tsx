'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { useState } from 'react';

const navItems = [
  {
    href: '/store',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/store/products',
    label: 'Products',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/store/mappings',
    label: 'Mappings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    href: '/store/rankings',
    label: 'Rankings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ),
  },
  {
    href: '/store/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/store/utm-links',
    label: 'UTM Links',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
  },
  {
    href: '/store/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function StoreSidebar() {
  const pathname = usePathname();
  const { vendor, logout } = useStoreAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="w-[56px] bg-white border-r border-gray-200 min-h-screen flex flex-col items-center py-4 flex-shrink-0">
      {/* Logo / Vendor Initial */}
      <Link href="/store" className="mb-6">
        {vendor?.logo_url ? (
          <img
            src={vendor.logo_url}
            alt={vendor.name}
            className="w-8 h-8 object-contain rounded"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {vendor?.name?.[0] || 'S'}
          </div>
        )}
      </Link>

      {/* Divider */}
      <div className="w-6 h-px bg-gray-200 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/store' && pathname.startsWith(item.href));

          return (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.icon}
              </Link>
              {/* Tooltip */}
              {hoveredItem === item.href && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
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
      <div className="w-6 h-px bg-gray-200 my-4" />

      {/* Logout */}
      <div className="relative">
        <button
          onClick={logout}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        {hoveredItem === 'logout' && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs font-medium rounded px-2 py-1 whitespace-nowrap">
              Logout
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
