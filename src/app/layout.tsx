import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nicotine Pouches - Price Comparison for Nicotine Pouches',
  description: 'Compare nicotine pouch prices across UK suppliers. Find the best deals on Zyn, Velo, Pablo, and more tobacco-free alternatives.',
  keywords: 'nicotine pouches, price comparison, UK suppliers, Zyn, Velo, Pablo, tobacco-free',
  authors: [{ name: 'Nicotine Pouches' }],
  openGraph: {
    title: 'Nicotine Pouches - Price Comparison',
    description: 'Compare nicotine pouch prices across UK suppliers. Find the best deals on Zyn, Velo, Pablo, and more tobacco-free alternatives.',
    url: 'https://nicotine-pouches.org',
    siteName: 'Nicotine Pouches',
    images: [
      {
        url: 'https://gianna.templweb.com/wp-content/uploads/2024/04/logo-2.png',
        width: 372,
        height: 59,
        alt: 'Nicotine Pouches Logo',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nicotinepouchesuk',
    title: 'Nicotine Pouches',
    description: 'Compare nicotine pouch prices across UK suppliers. Find the best deals on Zyn, Velo, Pablo, and more tobacco-free alternatives.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Suspense fallback={null}>
                <GoogleAnalytics />
              </Suspense>
              {children}
              <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
