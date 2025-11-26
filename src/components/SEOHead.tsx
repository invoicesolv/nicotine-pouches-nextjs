'use client';

import Head from 'next/head';
import { SEOOutput } from '@/lib/seo';

interface SEOHeadProps {
  seoData: SEOOutput;
  hreflang?: Array<{ lang: string; url: string }>;
}

export default function SEOHead({ seoData, hreflang = [] }: SEOHeadProps) {
  const { meta, schema_json_ld } = seoData;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={meta.robots} />
      <link rel="canonical" href={meta.canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={meta.og['og:title']} />
      <meta property="og:description" content={meta.og['og:description']} />
      <meta property="og:url" content={meta.og['og:url']} />
      <meta property="og:site_name" content={meta.og['og:site_name']} />
      <meta property="og:type" content={meta.og['og:type']} />
      <meta property="og:image" content={meta.og['og:image']} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={meta.twitter.card} />
      <meta name="twitter:title" content={meta.twitter.title} />
      <meta name="twitter:description" content={meta.twitter.description} />
      <meta name="twitter:image" content={meta.twitter.image} />

      {/* Hreflang Tags */}
      {hreflang.map((item) => (
        <link key={item.lang} rel="alternate" hrefLang={item.lang} href={item.url} />
      ))}

      {/* Structured Data - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema_json_ld.BreadcrumbList)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema_json_ld.WebPage)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema_json_ld.ItemList)
        }}
      />
      {schema_json_ld.Product_set.map((product, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(product)
          }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema_json_ld.FAQPage)
        }}
      />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preload critical resources */}
      <link rel="preload" href={meta.og['og:image']} as="image" />
    </Head>
  );
}
