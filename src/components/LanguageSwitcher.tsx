'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import type { LanguageCode } from '@/contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';

// SVG flag components - small inline flags
const FlagUK = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="60" height="40" fill="#00247D"/>
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#CF142B" strokeWidth="4" clipPath="url(#uk-clip)"/>
    <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 V40 M0,20 H60" stroke="#CF142B" strokeWidth="6"/>
  </svg>
);

const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="60" height="40" fill="#B22234"/>
    <rect y="3" width="60" height="3" fill="#fff"/>
    <rect y="9" width="60" height="3" fill="#fff"/>
    <rect y="15" width="60" height="3" fill="#fff"/>
    <rect y="21" width="60" height="3" fill="#fff"/>
    <rect y="27" width="60" height="3" fill="#fff"/>
    <rect y="33" width="60" height="3" fill="#fff"/>
    <rect width="24" height="21" fill="#3C3B6E"/>
  </svg>
);

const FlagDE = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="60" height="13.3" fill="#000"/>
    <rect y="13.3" width="60" height="13.4" fill="#DD0000"/>
    <rect y="26.7" width="60" height="13.3" fill="#FFCE00"/>
  </svg>
);

const FlagIT = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="40" fill="#009246"/>
    <rect x="20" width="20" height="40" fill="#fff"/>
    <rect x="40" width="20" height="40" fill="#CE2B37"/>
  </svg>
);

const FlagES = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" style={{ borderRadius: '2px', flexShrink: 0 }}>
    <rect width="60" height="10" fill="#AA151B"/>
    <rect y="10" width="60" height="20" fill="#F1BF00"/>
    <rect y="30" width="60" height="10" fill="#AA151B"/>
  </svg>
);

const flagComponents: Record<string, React.FC> = {
  uk: FlagUK,
  us: FlagUS,
  de: FlagDE,
  it: FlagIT,
  es: FlagES,
};

const LanguageSwitcher = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const languages: { code: LanguageCode; name: string }[] = [
    { code: 'uk', name: 'United Kingdom' },
    { code: 'us', name: 'United States' },
    { code: 'de', name: 'Deutschland' },
    { code: 'it', name: 'Italia' },
    { code: 'es', name: 'España' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const CurrentFlag = flagComponents[currentLanguage] || FlagUK;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        style={{ gap: '6px', display: 'flex', alignItems: 'center' }}
      >
        <CurrentFlag />
        <span>{currentLang?.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((lang) => {
              const Flag = flagComponents[lang.code] || FlagUK;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    currentLanguage === lang.code ? 'bg-gray-50 font-medium' : ''
                  }`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Flag />
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
