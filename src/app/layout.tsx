import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SearchConsoleMonitor from '@/components/SearchConsoleMonitor'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nicotine-pouches.org'),
  title: 'Nicotine Pouches - Premium Quality Products',
  description: 'Discover the best nicotine pouches with premium quality and great flavors.',
  verification: {
    google: 'JbEphvt9eU2dj-sUX5ZgfPmesjuASIeelqUUIC9DFS0',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nicotine Pouches",
    "alternateName": "Nicotine Pouches UK",
    "url": "https://nicotine-pouches.org",
    "logo": {
      "@type": "ImageObject",
      "url": "https://nicotine-pouches.org/logo.png",
      "width": 200,
      "height": 60
    },
    "description": "Premium nicotine pouches price comparison service. Find the best deals on nicotine pouches in the UK with our comprehensive price comparison platform.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Nicotine Pouches Team"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressRegion": "England"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@nicotine-pouches.org",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://twitter.com/nicotinepouches",
      "https://facebook.com/nicotinepouches",
      "https://instagram.com/nicotinepouches"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Nicotine Pouches",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "ZYN Nicotine Pouches",
            "description": "Premium ZYN nicotine pouches in various flavors and strengths"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Velo Nicotine Pouches",
            "description": "High-quality Velo nicotine pouches with refreshing flavors"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Loop Nicotine Pouches",
            "description": "Innovative Loop nicotine pouches with unique taste profiles"
          }
        }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nicotine-pouches.org/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nicotine Pouches",
    "alternateName": "Nicotine Pouches UK",
    "url": "https://nicotine-pouches.org",
    "description": "Find the best nicotine pouches deals in the UK. Compare prices across top brands like ZYN, Velo, and Loop.",
    "publisher": {
      "@type": "Organization",
      "name": "Nicotine Pouches",
      "url": "https://nicotine-pouches.org"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nicotine-pouches.org/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are nicotine pouches UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nicotine pouches UK are smoke-free, tobacco-free alternatives that provide nicotine without the need for smoking or vaping. They come in various flavors and strengths, offering a discreet and convenient way to enjoy nicotine."
        }
      },
      {
        "@type": "Question",
        "name": "How do I compare nicotine pouch prices in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our price comparison service allows you to easily compare prices across all major UK retailers. Simply browse our platform to find the best deals on your favorite brands like VELO, Skruf, and LOOP, ensuring you never overpay for premium products."
        }
      },
      {
        "@type": "Question",
        "name": "What brands of nicotine pouches are available in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Popular brands available in the UK include VELO, Skruf, LOOP, White Fox, and Lynx. Our platform covers all major brands and retailers, from established names to emerging favorites, giving you access to the widest selection of products."
        }
      },
      {
        "@type": "Question",
        "name": "Are nicotine pouches legal in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, nicotine pouches are legal in the UK. They are regulated as consumer products and can be purchased from licensed retailers. Our platform only features products from legitimate, authorized UK retailers."
        }
      },
      {
        "@type": "Question",
        "name": "What flavors of nicotine pouches can I find?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nicotine pouches come in a wide variety of flavors including mint, peppermint, fruit flavors, coffee, liquorice, and many more. Popular options include VELO Crispy Peppermint, fruity LOOP varieties, and traditional tobacco-inspired flavors."
        }
      },
      {
        "@type": "Question",
        "name": "How much can I save by comparing prices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our users typically save up to 40% on large orders by comparing prices across retailers. We also help you find exclusive bulk discounts, special offers, and free delivery options on orders over £30, ensuring you get the best value for your money."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer free delivery on nicotine pouches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Many retailers we feature offer free delivery on orders above a certain amount, typically £30 or more. Our platform clearly shows delivery options and costs, helping you find the best deals including free shipping offers."
        }
      },
      {
        "@type": "Question",
        "name": "How quickly can I receive my nicotine pouches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Delivery times vary by retailer, but most offer fast, reliable shipping across the UK. From London to Glasgow, you can expect quick delivery times. Our platform shows estimated delivery times for each retailer to help you choose the best option for your needs."
        }
      },
      {
        "@type": "Question",
        "name": "What strength options are available for nicotine pouches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nicotine pouches come in various strengths from low (around 3-4mg) to extra strong (8mg+). You can find slim pouches for discreet use, strong pouches for a powerful hit, and even nicotine-free options for those looking to cut down gradually."
        }
      },
      {
        "@type": "Question",
        "name": "How do I know which nicotine pouch is right for me?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Consider your current nicotine intake, preferred strength, and flavor preferences. Start with lower strengths if you're new to nicotine pouches, and experiment with different flavors. Our platform provides detailed product information to help you make informed choices."
        }
      }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
            __html: JSON.stringify(faqSchema)
          }}
        />
      </head>
      <body className={inter.className}>
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
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
