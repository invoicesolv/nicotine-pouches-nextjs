'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface LanguageContextType {
  currentLanguage: 'uk' | 'us';
  setLanguage: (lang: 'uk' | 'us') => void;
  getLocalizedPath: (path: string) => string;
  isUSRoute: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<'uk' | 'us'>('uk');
  const pathname = usePathname();
  const router = useRouter();

  // Determine current language based on pathname
  useEffect(() => {
    if (pathname.startsWith('/us')) {
      setCurrentLanguage('us');
    } else {
      setCurrentLanguage('uk');
    }
  }, [pathname]);

  const setLanguage = (lang: 'uk' | 'us') => {
    // Clean up the current path first
    let cleanPath = pathname;
    
    // Remove any existing /us/ prefix
    if (cleanPath.startsWith('/us/')) {
      cleanPath = cleanPath.substring(3);
    }
    
    // Handle double /us/us case
    if (cleanPath.startsWith('/us')) {
      cleanPath = cleanPath.substring(3);
    }
    
    if (cleanPath === '') cleanPath = '/';
    
    // Don't do anything if we're already on the correct language
    const isCurrentlyUS = pathname.startsWith('/us/') || pathname === '/us';
    const isCurrentlyUK = !isCurrentlyUS;
    
    if ((lang === 'us' && isCurrentlyUS) || (lang === 'uk' && isCurrentlyUK)) {
      return;
    }
    
    setCurrentLanguage(lang);
    
    // Navigate to the new language version
    if (lang === 'us') {
      router.push(`/us${cleanPath}`);
    } else {
      router.push(cleanPath);
    }
  };

  const getLocalizedPath = (path: string) => {
    // If path already starts with /us/, return as is for US routes
    if (path.startsWith('/us/')) {
      return `https://nicotine-pouches.org${path}`;
    }
    
    // If path already starts with / and we're on UK route, return as is
    if (path.startsWith('/') && currentLanguage === 'uk') {
      return `https://nicotine-pouches.org${path}`;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    if (currentLanguage === 'us') {
      return `https://nicotine-pouches.org/us/${cleanPath}`;
    } else {
      return `https://nicotine-pouches.org/${cleanPath}`;
    }
  };

  const isUSRoute = pathname.startsWith('/us');

  const value = {
    currentLanguage,
    setLanguage,
    getLocalizedPath,
    isUSRoute
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
