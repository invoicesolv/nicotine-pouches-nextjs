'use client';

import Head from 'next/head';
import { LLMSEOOutput } from '@/lib/llm-seo';

interface LLMSEOHeadProps {
  llmSeoData: LLMSEOOutput;
  hreflang?: Array<{ lang: string; url: string }>;
}

export default function LLMSEOHead({ llmSeoData, hreflang = [] }: LLMSEOHeadProps) {
  const { meta, schema_json_ld, freshness_signals } = llmSeoData;

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

      {/* LLM-Optimized Structured Data - Single @graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema_json_ld)
        }}
      />

      {/* Freshness Signals */}
      <meta name="last-modified" content={freshness_signals.page_modified} />
      <link rel="alternate" type="application/json" href={freshness_signals.changelog_url} title="Changelog" />

      {/* Additional LLM-Friendly Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preload critical resources for LLM consumption */}
      <link rel="preload" href={meta.og['og:image']} as="image" />
      <link rel="preload" href={freshness_signals.changelog_url} as="fetch" crossOrigin="anonymous" />
    </Head>
  );
}
