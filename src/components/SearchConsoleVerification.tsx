'use client';

import Head from 'next/head';

interface SearchConsoleVerificationProps {
  verificationCode?: string;
}

export default function SearchConsoleVerification({ 
  verificationCode = 'JbEphvt9eU2dj-sUX5ZgfPmesjuASIeelqUUIC9DFS0' 
}: SearchConsoleVerificationProps) {
  return (
    <Head>
      {/* Google Search Console Verification */}
      <meta name="google-site-verification" content={verificationCode} />
      
      {/* Additional Search Console Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Structured Data for Search Console */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Nicotine Pouches",
            "url": "https://nicotine-pouches.org",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://nicotine-pouches.org/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </Head>
  );
}
