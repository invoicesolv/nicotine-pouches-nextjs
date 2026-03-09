import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SearchConsoleMonitor from '@/components/SearchConsoleMonitor'
import { LiveChatWidget } from '@/components/LiveChatWidget'
import ClientPriceAlertModal from '@/components/ClientPriceAlertModal'
// AdSenseInit removed from global layout — ads only on product pages & guide posts

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nicotine-pouches.org'),
  title: 'Nicotine Pouches UK — Compare Prices Across 10+ Shops | nicotine-pouches.org',
  description: 'The UK\'s largest nicotine pouch price comparison site. Compare 700+ products across 10+ shops with live prices, shipping costs, stock status, and vendor ratings. Find the cheapest ZYN, VELO, and Nordic Spirit deals updated daily.',
  verification: {
    google: 'JbEphvt9eU2dj-sUX5ZgfPmesjuASIeelqUUIC9DFS0',
  },
}

// Viewport export - ensures proper viewport meta tag in first 1024 bytes
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://nicotine-pouches.org/#organization",
    "name": "Nicotine Pouches",
    "alternateName": ["Nicotine Pouches UK", "nicotine-pouches.org", "NicotinePouches"],
    "url": "https://nicotine-pouches.org",
    "logo": {
      "@type": "ImageObject",
      "url": "https://nicotine-pouches.org/logo.png",
      "width": 200,
      "height": 60
    },
    "image": "https://nicotine-pouches.org/android-chrome-512x512.png",
    "description": "The UK's largest nicotine pouch price comparison site. Compare 700+ products across 10+ retailers with live prices, reviews, and stock updates.",
    "foundingDate": "2021",
    "founder": {
      "@type": "Person",
      "name": "Kevin Negash"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@nicotine-pouches.org",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://x.com/nicotinepouchuk",
      "https://www.instagram.com/nicotinepouchesorg/",
      "https://www.facebook.com/profile.php?id=61584629112745"
    ],
    "knowsAbout": [
      "Nicotine pouch price comparison",
      "Cheapest nicotine pouches UK",
      "Nicotine pouch prices",
      "ZYN nicotine pouches",
      "VELO nicotine pouches",
      "Nordic Spirit nicotine pouches",
      "Where to buy nicotine pouches UK",
      "Nicotine pouch shipping costs UK",
      "UK nicotine pouch market",
      "US nicotine pouch market"
    ],
    "areaServed": [
      {
        "@type": "Country",
        "name": "United Kingdom"
      },
      {
        "@type": "Country",
        "name": "United States"
      }
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://nicotine-pouches.org/#website",
    "name": "Nicotine Pouches",
    "alternateName": "Nicotine Pouches UK",
    "url": "https://nicotine-pouches.org",
    "description": "Compare nicotine pouch prices across 10+ UK retailers. 700+ products with live prices, ratings, and stock status.",
    "publisher": {
      "@id": "https://nicotine-pouches.org/#organization"
    },
    "inLanguage": ["en-GB", "en-US"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nicotine-pouches.org/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": "https://nicotine-pouches.org/#brand",
    "name": "Nicotine Pouches",
    "alternateName": "nicotine-pouches.org",
    "url": "https://nicotine-pouches.org",
    "logo": "https://nicotine-pouches.org/logo.png",
    "description": "The UK's go-to nicotine pouch comparison site since 2021. Compare prices, read reviews, find the cheapest deals.",
    "slogan": "Compare. Save. Switch."
  }

  const sitelinksSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Compare Prices",
        "url": "https://nicotine-pouches.org/compare"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "All Brands",
        "url": "https://nicotine-pouches.org/brands"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "How to Use",
        "url": "https://nicotine-pouches.org/how-to-use"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Guides",
        "url": "https://nicotine-pouches.org/guides"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 5,
        "name": "All Vendors",
        "url": "https://nicotine-pouches.org/vendors"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 6,
        "name": "Blog",
        "url": "https://nicotine-pouches.org/blog"
      }
    ]
  }

  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} ${plusJakartaSans.variable}`}>
        {/* JSON-LD Schema scripts - placed in body to keep head small for charset in first 1024 bytes */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(brandSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(sitelinksSchema)
          }}
        />
        {/* AdSense script removed from global layout — loaded only on product pages & guide posts */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9FT722JELW'}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9FT722JELW'}', {
              page_title: document.title,
              page_location: window.location.href,
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <GoogleAnalytics />
            <SearchConsoleMonitor />
            <LiveChatWidget />
            <ClientPriceAlertModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
