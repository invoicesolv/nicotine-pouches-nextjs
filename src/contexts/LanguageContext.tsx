'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type LanguageCode = 'uk' | 'us' | 'de' | 'it' | 'es';

const LOCALE_PREFIXES = ['us', 'de', 'it', 'es'] as const;

// Translated URL slugs for each locale
const SLUG_MAP: Record<string, Record<string, string>> = {
  de: {
    'about-us': 'ueber-uns',
    'become-a-member': 'mitglied-werden',
    'brands': 'marken',
    'careers': 'karriere',
    'compare': 'vergleichen',
    'contact-us': 'kontakt',
    'digital-services-act': 'gesetz-ueber-digitale-dienste',
    'frequently-asked-questions': 'haeufig-gestellte-fragen',
    'guides': 'ratgeber',
    'here-we-are': 'hier-sind-wir',
    'how-to-use': 'anwendung',
    'privacy-policy': 'datenschutz',
    'safe-online-shopping': 'sicheres-online-shopping',
    'sustainability': 'nachhaltigkeit',
    'terms-and-conditions': 'agb',
    'thank-you': 'danke',
    'vendors': 'anbieter',
    'why-nicotine-pouches': 'warum-nikotinbeutel',
    'work-with-us': 'zusammenarbeit',
  },
  it: {
    'about-us': 'chi-siamo',
    'become-a-member': 'diventa-membro',
    'brands': 'marchi',
    'careers': 'carriere',
    'compare': 'confronta',
    'contact-us': 'contattaci',
    'digital-services-act': 'legge-sui-servizi-digitali',
    'frequently-asked-questions': 'domande-frequenti',
    'guides': 'guide',
    'here-we-are': 'dove-siamo',
    'how-to-use': 'come-usare',
    'privacy-policy': 'informativa-privacy',
    'safe-online-shopping': 'acquisti-online-sicuri',
    'sustainability': 'sostenibilita',
    'terms-and-conditions': 'termini-e-condizioni',
    'thank-you': 'grazie',
    'vendors': 'venditori',
    'why-nicotine-pouches': 'perche-bustine-nicotina',
    'work-with-us': 'lavora-con-noi',
  },
  es: {
    'about-us': 'sobre-nosotros',
    'become-a-member': 'hazte-miembro',
    'brands': 'marcas',
    'careers': 'empleo',
    'compare': 'comparar',
    'contact-us': 'contacto',
    'digital-services-act': 'ley-servicios-digitales',
    'frequently-asked-questions': 'preguntas-frecuentes',
    'guides': 'guias',
    'here-we-are': 'donde-estamos',
    'how-to-use': 'como-usar',
    'privacy-policy': 'politica-privacidad',
    'safe-online-shopping': 'compras-online-seguras',
    'sustainability': 'sostenibilidad',
    'terms-and-conditions': 'terminos-y-condiciones',
    'thank-you': 'gracias',
    'vendors': 'vendedores',
    'why-nicotine-pouches': 'por-que-bolsas-nicotina',
    'work-with-us': 'trabaja-con-nosotros',
  },
};

function translatePath(path: string, locale: string): string {
  if (!SLUG_MAP[locale]) return path;
  // Translate the first segment of the path (e.g. /about-us -> /ueber-uns)
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && SLUG_MAP[locale][segments[0]]) {
    segments[0] = SLUG_MAP[locale][segments[0]];
  }
  return '/' + segments.join('/');
}

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  getLocalizedPath: (path: string) => string;
  isUSRoute: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const defaultLanguageContext: LanguageContextType = {
  currentLanguage: 'uk',
  setLanguage: () => {},
  getLocalizedPath: (path: string) => path,
  isUSRoute: false
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.warn('useLanguage called outside LanguageProvider, using defaults');
    return defaultLanguageContext;
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

function detectLanguageFromPathname(pathname: string): LanguageCode {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`)) {
      return prefix as LanguageCode;
    }
  }
  return 'uk';
}

function stripLocalePrefix(pathname: string): string {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === `/${prefix}`) return '/';
    if (pathname.startsWith(`/${prefix}/`)) return pathname.substring(prefix.length + 1);
  }
  return pathname;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => detectLanguageFromPathname(pathname));

  useEffect(() => {
    setCurrentLanguage(detectLanguageFromPathname(pathname));
  }, [pathname]);

  const setLanguage = (lang: LanguageCode) => {
    const cleanPath = stripLocalePrefix(pathname);
    if (lang === currentLanguage) return;
    setCurrentLanguage(lang);

    if (lang === 'uk') {
      router.push(cleanPath);
    } else if (lang === 'us') {
      router.push(`/us${cleanPath === '/' ? '' : cleanPath}`);
    } else {
      const translated = translatePath(cleanPath, lang);
      router.push(`/${lang}${translated === '/' ? '' : translated}`);
    }
  };

  const getLocalizedPath = (path: string) => {
    const cleanPath = stripLocalePrefix(path);

    if (currentLanguage === 'uk') {
      return cleanPath;
    }

    if (currentLanguage === 'us') {
      const suffix = cleanPath === '/' ? '' : cleanPath;
      return `/us${suffix}`;
    }

    // Translated locales: translate the slug
    const translated = translatePath(cleanPath, currentLanguage);
    const suffix = translated === '/' ? '' : translated;
    return `/${currentLanguage}${suffix}`;
  };

  const isUSRoute = currentLanguage === 'us';

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, getLocalizedPath, isUSRoute }}>
      {children}
    </LanguageContext.Provider>
  );
};
