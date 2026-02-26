'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getUSBrandLogo } from '@/lib/brand-logos';

// Popular US brand names to display on homepage
const usMainBrands = [
  'ZYN',
  'VELO',
  'On',
  'Rogue',
  'Lucy',
  'FRE',
  'White Fox',
  'Siberia',
  'XQS',
  'Zone',
  'Grizzly',
  'Juice Head',
  'NIC-S',
  'Sesh',
  'ALP',
  'Bridge',
  'Vito',
  'Zimo',
  'ZEO',
  'SYX'
];

export default function USHomepageBrandLogos() {
  const brandsWithLogos = usMainBrands
    .map(brand => ({
      name: brand,
      slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      logo: getUSBrandLogo(brand)
    }))
    .filter(brand => brand.logo);

  if (brandsWithLogos.length === 0) {
    return null;
  }

  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brandsWithLogos, ...brandsWithLogos];

  return (
    <>
      <style jsx global>{`
        @keyframes marquee-scroll-us {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-60px * ${brandsWithLogos.length} - 40px * ${brandsWithLogos.length}));
          }
        }
        .us-brand-logos-container {
          display: block !important;
        }
        @media (max-width: 768px) {
          .us-brand-logos-container {
            display: none !important;
          }
        }
        .us-brand-logos-inner {
          max-width: 1400px;
          width: calc(100% - 80px);
          margin: 0 auto;
          overflow: hidden;
        }
        @media (min-width: 1536px) {
          .us-brand-logos-inner {
            max-width: 90% !important;
          }
        }
        .us-marquee-track {
          display: flex;
          align-items: center;
          gap: 40px;
          width: max-content;
          animation: marquee-scroll-us 25s linear infinite;
        }
        .us-marquee-track:hover {
          animation-play-state: paused;
        }
        .us-brand-logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0.7;
          filter: grayscale(20%);
          transition: filter 0.3s ease, transform 0.2s ease, opacity 0.2s ease;
        }
        .us-brand-logo-link:hover {
          filter: grayscale(0%);
          transform: scale(1.15);
          opacity: 1;
        }
      `}</style>
      <div className="us-brand-logos-container" style={{
        width: '100%',
        paddingTop: '8px',
        paddingBottom: '8px',
        backgroundColor: 'transparent',
        marginTop: '-15px',
        marginBottom: '0',
        overflow: 'hidden'
      }}>
        <div className="us-brand-logos-inner" style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}>
          <div className="us-marquee-track">
            {duplicatedBrands.map((brand, index) => (
              <Link
                key={`${brand.slug}-${index}`}
                href={`/us/brands/${brand.slug}`}
                className="us-brand-logo-link"
              >
                <Image
                  src={brand.logo!}
                  alt={`${brand.name} logo`}
                  width={60}
                  height={60}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain'
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
