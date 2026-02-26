'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import HeroSearchBar from '@/components/HeroSearchBar';

export function CTASection() {
  const { isUSRoute } = useLanguage();

  return (
    <section className="pt-1 pb-4 w-full flex justify-center items-center">
      {/* Hidden preload images for LCP optimization with fetchpriority="high" */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isUSRoute ? '/la-mia.png' : '/big-ben-mobile.webp'}
        alt=""
        fetchPriority="high"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      />
      {/* Desktop preload for UK */}
      {!isUSRoute && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/big-ben.webp"
          alt=""
          fetchPriority="high"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-bg-uk {
          background: linear-gradient(to right, #1f2544 0%, rgba(31,37,68,0.8) 35%, rgba(31,37,68,0.4) 100%), url('/big-ben-mobile.webp');
          background-size: cover;
          background-position: right center;
        }
        .hero-bg-us {
          background: linear-gradient(to right, #1f2544 0%, rgba(31,37,68,0.8) 35%, rgba(31,37,68,0.4) 100%), url('/la-mia.png');
          background-size: cover;
          background-position: right center;
        }
        @media (min-width: 768px) {
          .hero-bg-uk {
            background: linear-gradient(to right, #1f2544 0%, rgba(31,37,68,0.8) 35%, rgba(31,37,68,0.4) 100%), url('/big-ben.webp');
            background-size: cover;
            background-position: right center;
          }
        }
      `}} />
      <div
        className="relative w-[calc(100%-80px)] max-w-[1400px] 2xl:max-w-[90%]"
      >
        {/* Hero background with overflow-hidden for phone clipping */}
        <div
          className={`absolute inset-0 overflow-hidden rounded-[20px] ${isUSRoute ? 'hero-bg-us' : 'hero-bg-uk'}`}
        >
          {/* Phone Mockup - Inside clipped container */}
          <div className="hidden md:block absolute right-0 lg:right-8 2xl:right-16 -bottom-32 w-[450px] lg:w-[580px] xl:w-[700px] 2xl:w-[850px] h-[580px] lg:h-[700px] xl:h-[800px] 2xl:h-[950px]">
            <Image
              src="/iphone-mockup.png"
              alt="Nicotine Pouches app on mobile"
              fill
              style={{ objectFit: 'contain', objectPosition: 'bottom' }}
              priority
            />
          </div>
        </div>

        {/* Content layer - NOT clipped */}
        <div className="relative z-10 rounded-[20px] border border-border shadow-sm min-h-[360px] md:min-h-[420px] lg:min-h-[450px] 2xl:min-h-[500px] flex flex-col items-start justify-center">
          <div className="px-6 md:px-8 lg:px-12 py-10 md:py-12 text-left flex flex-col items-start max-w-[650px]" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>

            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black mb-5">
              {isUSRoute ? 'Nicotine Pouches US' : 'Nicotine Pouches UK'}
            </h1>

            <p className="text-white text-2xl md:text-3xl font-semibold mb-4 leading-tight">
              {isUSRoute
                ? 'Compare 500+ products. Buy from the cheapest shop.'
                : 'Compare 700+ products. Buy from the cheapest shop.'}
            </p>

            <p className="text-white/80 text-lg max-w-[450px] mb-6">
              {isUSRoute
                ? 'Prices updated daily from 50+ US retailers. Find the best deals on ZYN, VELO & more.'
                : 'Prices updated daily from 10+ UK retailers. Find the best deals on ZYN, VELO & more.'}
            </p>

            <HeroSearchBar />
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection;
