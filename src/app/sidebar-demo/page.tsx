'use client';

import { SidebarDemo } from '@/components/ui/sidebar-demo';

export default function SidebarDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Sidebar Component Demo
        </h1>
        <SidebarDemo />
      </div>
    </div>
  );
}
