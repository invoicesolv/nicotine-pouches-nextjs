'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

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

interface CombinedFilterPopupProps {
  selectedPack: string;
  selectedShipping: string;
  availablePackSizes?: string[]; // Optional: if provided, only show these pack sizes
}

export default function CombinedFilterPopup({ selectedPack, selectedShipping, availablePackSizes }: CombinedFilterPopupProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [priceSort, setPriceSort] = useState('low-high');
  const [shippingFilter, setShippingFilter] = useState(selectedShipping || 'fastest');

  // Determine effective pack size - if selected is not available, use first available
  const effectiveSelectedPack = availablePackSizes && availablePackSizes.length > 0
    ? (availablePackSizes.includes(selectedPack) ? selectedPack : availablePackSizes[0])
    : (selectedPack || '1pack');

  const [packSize, setPackSize] = useState(effectiveSelectedPack);
  const [reviewSort, setReviewSort] = useState('reviews');
  const [minScore, setMinScore] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  // Update packSize if availablePackSizes changes and current selection is not valid
  useEffect(() => {
    if (availablePackSizes && availablePackSizes.length > 0 && !availablePackSizes.includes(packSize)) {
      setPackSize(availablePackSizes[0]);
    }
  }, [availablePackSizes, packSize]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Update hidden elements for ReviewFilter component
  useEffect(() => {
    const reviewSortSelect = document.getElementById('review-sort');
    if (reviewSortSelect) {
      (reviewSortSelect as HTMLSelectElement).value = reviewSort;
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      reviewSortSelect.dispatchEvent(changeEvent);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reviewSortChanged', { detail: { sortOrder: reviewSort } }));
      }
    }
  }, [reviewSort]);

  useEffect(() => {
    const reviewScoreSlider = document.getElementById('review-score-filter') as HTMLInputElement;
    const reviewScoreDisplay = document.getElementById('review-score-display');

    if (reviewScoreSlider) {
      reviewScoreSlider.value = minScore.toString();
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      reviewScoreSlider.dispatchEvent(inputEvent);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reviewScoreChanged', { detail: { minScore } }));
      }
    }

    if (reviewScoreDisplay) {
      reviewScoreDisplay.textContent = minScore > 0 ? `${minScore.toFixed(1)}+` : '0+';
    }
  }, [minScore]);

  // Update price sort
  useEffect(() => {
    const priceSortSelect = document.getElementById('price-sort');
    if (priceSortSelect) {
      (priceSortSelect as HTMLSelectElement).value = priceSort;
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      priceSortSelect.dispatchEvent(changeEvent);
    }
  }, [priceSort]);

  // Update pack size
  useEffect(() => {
    const packSizeSelect = document.getElementById('pack-size');
    if (packSizeSelect) {
      (packSizeSelect as HTMLSelectElement).value = packSize;
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      packSizeSelect.dispatchEvent(changeEvent);
    }
  }, [packSize]);

  // Update shipping filter
  useEffect(() => {
    const shippingSelect = document.getElementById('shipping-sort');
    if (shippingSelect) {
      (shippingSelect as HTMLSelectElement).value = shippingFilter;
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      shippingSelect.dispatchEvent(changeEvent);
    }
  }, [shippingFilter]);

  const handleApplyFilters = () => {
    const currentParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    currentParams.set('pack', packSize);
    currentParams.set('shipping', shippingFilter);
    router.push(`?${currentParams.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  // Filter pack sizes to only show available ones (if provided)
  const packSizeOptions = availablePackSizes
    ? ALL_PACK_SIZES.filter(pack => availablePackSizes.includes(pack.value))
    : ALL_PACK_SIZES;

  return (
    <>
      {/* Hidden elements for existing filter components */}
      <select id="review-sort" defaultValue="reviews" style={{ display: 'none' }}>
        <option value="reviews">Reviews</option>
        <option value="highest">Highest Reviews</option>
      </select>
      <input type="range" id="review-score-filter" min="0" max="5" step="0.1" defaultValue="0" style={{ display: 'none' }} />
      <span id="review-score-display" style={{ display: 'none' }}>0+</span>
      <select id="price-sort" defaultValue="low-high" style={{ display: 'none' }}>
        <option value="low-high">Lowest Price</option>
      </select>
      <select id="pack-size" defaultValue={packSize} style={{ display: 'none' }}>
        {packSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <select id="shipping-sort" defaultValue={shippingFilter} style={{ display: 'none' }}>
        <option value="fastest">Fastest Shipping</option>
        <option value="free">Free Shipping Only</option>
      </select>

      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          border: '1px solid #dadce0',
          color: '#202124',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
          <circle cx="8" cy="6" r="2" fill="currentColor"/>
          <circle cx="16" cy="12" r="2" fill="currentColor"/>
          <circle cx="10" cy="18" r="2" fill="currentColor"/>
        </svg>
      </button>

      {/* Mobile Bottom Sheet Modal - Rendered via Portal to escape stacking context */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99998,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />

          {/* Bottom Sheet */}
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '90vh',
              backgroundColor: '#fff',
              borderRadius: '20px 20px 0 0',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            {/* Drag Handle */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '12px 0 8px'
            }}>
              <div style={{
                width: '36px',
                height: '4px',
                backgroundColor: '#dadce0',
                borderRadius: '2px'
              }} />
            </div>

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px 16px',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <div style={{ width: '40px' }} />
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#202124',
                margin: 0
              }}>
                Filter
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#5f6368'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              paddingBottom: '100px'
            }}>
              {/* Display Options */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202124',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}>
                  Display Options
                </h3>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  padding: '12px 0'
                }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    border: onlyInStock ? '2px solid #1a73e8' : '2px solid #dadce0',
                    backgroundColor: onlyInStock ? '#1a73e8' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}>
                    {onlyInStock && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '15px', color: '#202124', fontWeight: '400' }}>
                    Only in stock
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Pack Size */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202124',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}>
                  Pack Size
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {packSizeOptions.map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        padding: '12px 0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: packSize === option.value ? '2px solid #1a73e8' : '2px solid #dadce0',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0
                      }}>
                        {packSize === option.value && (
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#1a73e8'
                          }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: '15px',
                        color: '#202124',
                        fontWeight: packSize === option.value ? '500' : '400'
                      }}>
                        {option.label}
                      </span>
                      <input
                        type="radio"
                        name="pack-size-radio"
                        value={option.value}
                        checked={packSize === option.value}
                        onChange={(e) => setPackSize(e.target.value)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Shipping Options */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202124',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}>
                  Shipping
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { value: 'fastest', label: 'Fastest Shipping' },
                    { value: 'free', label: 'Free Shipping Only' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        padding: '12px 0'
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: shippingFilter === option.value ? '2px solid #1a73e8' : '2px solid #dadce0',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0
                      }}>
                        {shippingFilter === option.value && (
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#1a73e8'
                          }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: '15px',
                        color: '#202124',
                        fontWeight: shippingFilter === option.value ? '500' : '400'
                      }}>
                        {option.label}
                      </span>
                      <input
                        type="radio"
                        name="shipping-radio"
                        value={option.value}
                        checked={shippingFilter === option.value}
                        onChange={(e) => setShippingFilter(e.target.value)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202124',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Sort by
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1px solid #dadce0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#5f6368'
                  }}>
                    ?
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { value: 'low-high', label: 'Lowest Price' },
                    { value: 'reviews', label: 'Best Reviews' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        padding: '12px 0'
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: (option.value === 'low-high' ? priceSort : reviewSort) === option.value ? '2px solid #1a73e8' : '2px solid #dadce0',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        flexShrink: 0
                      }}>
                        {((option.value === 'low-high' && priceSort === 'low-high') ||
                          (option.value === 'reviews' && reviewSort === 'reviews')) && (
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#1a73e8'
                          }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: '15px',
                        color: '#202124',
                        fontWeight: '400'
                      }}>
                        {option.label}
                      </span>
                      <input
                        type="radio"
                        name="sort-radio"
                        value={option.value}
                        checked={option.value === 'low-high' ? priceSort === 'low-high' : reviewSort === 'reviews'}
                        onChange={() => {
                          if (option.value === 'low-high') {
                            setPriceSort('low-high');
                            setReviewSort('reviews');
                          } else {
                            setReviewSort('highest');
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Score */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202124',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}>
                  Minimum Rating: {minScore > 0 ? `${minScore.toFixed(1)}★` : 'Any'}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  <span style={{ fontSize: '13px', color: '#5f6368' }}>0</span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minScore}
                    onChange={(e) => setMinScore(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: `linear-gradient(to right, #1a73e8 ${minScore * 20}%, #dadce0 ${minScore * 20}%)`,
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#5f6368' }}>5★</span>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 20px',
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              backgroundColor: '#fff',
              borderTop: '1px solid #f1f3f4',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
            }}>
              <button
                onClick={handleApplyFilters}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: '#1a1f36',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '28px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(26, 31, 54, 0.3)'
                }}
              >
                Show results
              </button>
            </div>
          </div>

          {/* Animations */}
          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #1a73e8;
              cursor: pointer;
              border: 3px solid #fff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #1a73e8;
              cursor: pointer;
              border: 3px solid #fff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
          `}</style>
        </>,
        document.body
      )}
    </>
  );
}
