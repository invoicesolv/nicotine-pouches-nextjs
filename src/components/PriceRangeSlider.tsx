'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  priceDistribution?: number[];
  onChange: (min: number, max: number) => void;
  presetRanges?: { label: string; min: number; max: number; count: number }[];
  currency?: string;
}

const PriceRangeSlider = ({
  min = 0,
  max = 15,
  priceDistribution = [45, 78, 92, 34, 20, 10, 5, 3, 2, 1],
  onChange,
  presetRanges = [
    { label: 'Up to £3', min: 0, max: 3, count: 45 },
    { label: '£3 - £5', min: 3, max: 5, count: 78 },
    { label: '£5 - £8', min: 5, max: 8, count: 92 },
    { label: 'At least £8', min: 8, max: 15, count: 34 }
  ],
  currency = '£'
}: PriceRangeSliderProps) => {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const maxDistribution = Math.max(...priceDistribution);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(Math.max(min, value));
    setSelectedPreset(null);
    onChange(Math.max(min, value), maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(Math.min(max, value));
    setSelectedPreset(null);
    onChange(minValue, Math.min(max, value));
  };

  const handlePresetClick = (index: number, preset: typeof presetRanges[0]) => {
    setSelectedPreset(index);
    setMinValue(preset.min);
    setMaxValue(preset.max);
    onChange(preset.min, preset.max);
  };

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const handleRadius = 14;
    const trackStart = rect.left + handleRadius;
    const trackEnd = rect.right - handleRadius;
    const trackWidth = trackEnd - trackStart;
    const percentage = Math.max(0, Math.min(1, (clientX - trackStart) / trackWidth));
    return Math.round(percentage * (max - min) + min);
  }, [min, max]);

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleTouchStart = (type: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const value = getValueFromPosition(e.clientX);

    if (isDragging === 'min') {
      const newMin = Math.min(value, maxValue - 1);
      setMinValue(Math.max(min, newMin));
      setSelectedPreset(null);
    } else {
      const newMax = Math.max(value, minValue + 1);
      setMaxValue(Math.min(max, newMax));
      setSelectedPreset(null);
    }
  }, [isDragging, maxValue, minValue, getValueFromPosition, min, max]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    const value = getValueFromPosition(e.touches[0].clientX);

    if (isDragging === 'min') {
      const newMin = Math.min(value, maxValue - 1);
      setMinValue(Math.max(min, newMin));
      setSelectedPreset(null);
    } else {
      const newMax = Math.max(value, minValue + 1);
      setMaxValue(Math.min(max, newMax));
      setSelectedPreset(null);
    }
  }, [isDragging, maxValue, minValue, getValueFromPosition, min, max]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onChange(minValue, maxValue);
    }
    setIsDragging(null);
  }, [isDragging, minValue, maxValue, onChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="price-range-slider">
      {/* Histogram with slider */}
      <div
        ref={sliderRef}
        className="slider-container"
        style={{
          position: 'relative',
          height: '70px',
          marginBottom: '16px',
          paddingTop: '8px',
          userSelect: 'none'
        }}
      >
        {/* Histogram bars */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '14px',
          right: '14px',
          height: '36px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '3px',
          pointerEvents: 'none'
        }}>
          {priceDistribution.map((count, index) => {
            const height = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
            const barCenter = ((index + 0.5) / priceDistribution.length) * 100;
            const isInRange = barCenter >= minPercent && barCenter <= maxPercent;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  maxWidth: '16px',
                  height: `${Math.max(height, 8)}%`,
                  backgroundColor: isInRange ? '#9ca3af' : '#d1d5db',
                  borderRadius: '2px 2px 0 0',
                  transition: 'background-color 0.15s ease'
                }}
              />
            );
          })}
        </div>

        {/* Slider track */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          right: '14px',
          height: '2px',
          backgroundColor: '#e5e7eb',
          borderRadius: '1px',
          pointerEvents: 'none'
        }} />

        {/* Active track */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: `calc(14px + ${minPercent}% * (100% - 28px) / 100%)`,
          width: `calc(${maxPercent - minPercent}% * (100% - 28px) / 100%)`,
          height: '2px',
          backgroundColor: '#1f2937',
          borderRadius: '1px',
          pointerEvents: 'none'
        }} />

        {/* Min handle */}
        <div
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          style={{
            position: 'absolute',
            bottom: '0',
            left: `calc(${minPercent}% * (100% - 28px) / 100%)`,
            width: '28px',
            height: '28px',
            backgroundColor: '#ffffff',
            border: '2.5px solid #1f2937',
            borderRadius: '50%',
            transform: 'translateY(-50%)',
            cursor: isDragging === 'min' ? 'grabbing' : 'grab',
            zIndex: isDragging === 'min' ? 3 : 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            touchAction: 'none'
          }}
        />

        {/* Max handle */}
        <div
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          style={{
            position: 'absolute',
            bottom: '0',
            left: `calc(${maxPercent}% * (100% - 28px) / 100%)`,
            width: '28px',
            height: '28px',
            backgroundColor: '#ffffff',
            border: '2.5px solid #1f2937',
            borderRadius: '50%',
            transform: 'translateY(-50%)',
            cursor: isDragging === 'max' ? 'grabbing' : 'grab',
            zIndex: isDragging === 'max' ? 3 : 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Input Fields */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{
          flex: 1,
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <input
            type="number"
            value={minValue}
            onChange={handleMinChange}
            min={min}
            max={maxValue - 1}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: '400',
              color: '#1f2937',
              backgroundColor: 'transparent',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}
          />
        </div>
        <span style={{
          color: '#9ca3af',
          fontSize: '16px',
          fontWeight: '400',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>-</span>
        <div style={{
          flex: 1,
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <input
            type="number"
            value={maxValue}
            onChange={handleMaxChange}
            min={minValue + 1}
            max={max}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: '400',
              color: '#1f2937',
              backgroundColor: 'transparent',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}
          />
        </div>
      </div>

      {/* Preset Ranges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {presetRanges.map((preset, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => handlePresetClick(index, preset)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePresetClick(index, preset);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Radio button */}
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: `2px solid ${selectedPreset === index ? '#1f2937' : '#d1d5db'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.15s ease',
                flexShrink: 0
              }}>
                {selectedPreset === index && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#1f2937'
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '15px',
                fontWeight: selectedPreset === index ? '500' : '400',
                color: '#1f2937'
              }}>
                {preset.label}
              </span>
            </div>
            <span style={{
              fontSize: '14px',
              color: '#9ca3af',
              fontWeight: '400'
            }}>
              {preset.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
