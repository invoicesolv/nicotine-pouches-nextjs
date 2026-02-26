'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ReviewFilterDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('reviews');
  const [minScore, setMinScore] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // Update the hidden select element and trigger change event
    const reviewSortSelect = document.getElementById('review-sort');
    if (reviewSortSelect) {
      (reviewSortSelect as HTMLSelectElement).value = sortOrder;
      // Use a more reliable event dispatch
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      reviewSortSelect.dispatchEvent(changeEvent);
      
      // Also trigger a custom event for ReviewFilter
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reviewSortChanged', { detail: { sortOrder } }));
      }
    }
  }, [sortOrder]);

  useEffect(() => {
    // Update the hidden slider element and trigger input event
    const reviewScoreSlider = document.getElementById('review-score-filter') as HTMLInputElement;
    const reviewScoreDisplay = document.getElementById('review-score-display');
    
    if (reviewScoreSlider) {
      reviewScoreSlider.value = minScore.toString();
      // Use a more reliable event dispatch
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      reviewScoreSlider.dispatchEvent(inputEvent);
      
      // Also trigger a custom event for ReviewFilter
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reviewScoreChanged', { detail: { minScore } }));
      }
    }
    
    // Update display
    if (reviewScoreDisplay) {
      reviewScoreDisplay.textContent = minScore > 0 ? `${minScore.toFixed(1)}+` : '0+';
    }
  }, [minScore]);

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Hidden elements for ReviewFilter component */}
        <select id="review-sort" defaultValue="reviews" style={{ display: 'none' }}>
          <option value="reviews">Reviews</option>
          <option value="highest">Highest Reviews</option>
        </select>
        <input
          type="range"
          id="review-score-filter"
          min="0"
          max="5"
          step="0.1"
          defaultValue="0"
          style={{ display: 'none' }}
        />
        <span id="review-score-display" style={{ display: 'none' }}>0+</span>

        {/* Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '6px 12px',
            border: '1px solid #e9ecef',
            borderRadius: '20px',
            fontSize: '0.85rem',
            backgroundColor: '#fff',
            color: '#495057',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Reviews</span>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            backgroundColor: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            minWidth: '200px',
            zIndex: 99999
          }}
        >
          {/* Sort Options */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#495057', marginBottom: '8px', display: 'block' }}>
              Sort By
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="review-sort"
                  value="reviews"
                  checked={sortOrder === 'reviews'}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Reviews</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="radio"
                  name="review-sort"
                  value="highest"
                  checked={sortOrder === 'highest'}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Highest Reviews</span>
              </label>
            </div>
          </div>

          {/* Score Slider */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#495057', marginBottom: '8px', display: 'block' }}>
              Minimum Score: {minScore > 0 ? `${minScore.toFixed(1)}+` : '0+'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={minScore}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  setMinScore(newValue);
                  // Immediately update hidden slider and trigger event
                  const reviewScoreSlider = document.getElementById('review-score-filter') as HTMLInputElement;
                  const reviewScoreDisplay = document.getElementById('review-score-display');
                  if (reviewScoreSlider) {
                    reviewScoreSlider.value = newValue.toString();
                    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
                    reviewScoreSlider.dispatchEvent(inputEvent);
                  }
                  if (reviewScoreDisplay) {
                    reviewScoreDisplay.textContent = newValue > 0 ? `${newValue.toFixed(1)}+` : '0+';
                  }
                  // Trigger custom event
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reviewScoreChanged', { detail: { minScore: newValue } }));
                  }
                }}
                onInput={(e) => {
                  // Also handle onInput for real-time updates
                  const newValue = parseFloat((e.target as HTMLInputElement).value);
                  setMinScore(newValue);
                }}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: '#e9ecef',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

