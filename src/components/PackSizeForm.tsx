'use client';

import { useRouter, useSearchParams } from 'next/navigation';

// All possible pack sizes in order
const ALL_PACK_SIZES = [
  { value: '1pack', label: '1 Pack' },
  { value: '3pack', label: '3 Pack' },
  { value: '5pack', label: '5 Pack' },
  { value: '10pack', label: '10 Pack' },
  { value: '15pack', label: '15 Pack' },
  { value: '20pack', label: '20 Pack' },
  { value: '25pack', label: '25 Pack' },
  { value: '30pack', label: '30 Pack' },
  { value: '50pack', label: '50 Pack' },
  { value: '100pack', label: '100 Pack' },
];

interface PackSizeFormProps {
  selectedPack: string;
  availablePackSizes?: string[]; // Optional: if provided, only show these pack sizes
}

export default function PackSizeForm({ selectedPack, availablePackSizes }: PackSizeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePackChange = (newPack: string) => {
    // Create new URLSearchParams from current search params
    const params = new URLSearchParams(searchParams.toString());

    // Update the pack parameter
    params.set('pack', newPack);

    // Navigate to new URL without full page reload
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filter pack sizes to only show available ones (if provided)
  const packSizesToShow = availablePackSizes
    ? ALL_PACK_SIZES.filter(pack => availablePackSizes.includes(pack.value))
    : ALL_PACK_SIZES;

  // If current selection is not available, default to first available
  const effectiveSelectedPack = packSizesToShow.some(p => p.value === selectedPack)
    ? selectedPack
    : packSizesToShow[0]?.value || '1pack';

  return (
    <form method="GET" style={{ display: 'inline-block' }} onSubmit={(e) => e.preventDefault()}>
      <select
        name="pack"
        id="pack-size"
        value={effectiveSelectedPack}
        onChange={(e) => handlePackChange(e.target.value)}
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
        {packSizesToShow.map(pack => (
          <option key={pack.value} value={pack.value}>{pack.label}</option>
        ))}
      </select>
    </form>
  );
}
