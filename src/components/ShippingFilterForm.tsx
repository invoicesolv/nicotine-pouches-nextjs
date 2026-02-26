'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ShippingFilterFormProps {
  selectedShipping: string;
}

export default function ShippingFilterForm({ selectedShipping }: ShippingFilterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <select 
        style={{
          padding: '6px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '20px',
          fontSize: '0.85rem',
          backgroundColor: '#fff',
          color: '#495057',
          cursor: 'pointer',
          fontWeight: '500',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 8px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px',
          paddingRight: '32px'
        }}
        defaultValue={selectedShipping}
      >
        <option value="fastest">Fastest Shipping</option>
        <option value="free">Free Shipping Only</option>
      </select>
    );
  }

  const handleShippingChange = (newShipping: string) => {
    // Create new URLSearchParams from current search params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update the shipping parameter
    params.set('shipping', newShipping);
    
    // Navigate to new URL without full page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <form method="GET" style={{ display: 'inline-block' }} onSubmit={(e) => e.preventDefault()}>
      <select 
        name="shipping"
        id="shipping-sort"
        value={selectedShipping}
        onChange={(e) => handleShippingChange(e.target.value)}
        style={{
          padding: '6px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '20px',
          fontSize: '0.85rem',
          backgroundColor: '#fff',
          color: '#495057',
          cursor: 'pointer',
          fontWeight: '500',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 8px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px',
          paddingRight: '32px'
        }}
      >
        <option value="fastest">Fastest Shipping</option>
        <option value="free">Free Shipping Only</option>
      </select>
    </form>
  );
}
