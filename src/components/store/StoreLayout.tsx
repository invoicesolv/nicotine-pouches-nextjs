'use client';

import { useRequireStoreAuth } from '@/contexts/StoreAuthContext';
import StoreSidebar from './StoreSidebar';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const { loading, isAuthenticated } = useRequireStoreAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StoreSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
