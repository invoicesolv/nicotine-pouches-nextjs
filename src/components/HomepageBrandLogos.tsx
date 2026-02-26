'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getBrandLogo } from '@/lib/brand-logos';

// Popular/main brand names to display on homepage
const mainBrands = [
  'ZYN',
  'VELO',
  'Nordic Spirit',
  'On',
  'LOOP',
  'White Fox',
  'Pablo',
  'KILLA',
  'XQS',
  'LYFT',
  'Siberia',
  'Skruf',
  'Thunder',
  'Lundgrens',
  'Volt',
  'V&YOU',
  'Stellar'
];

export default function HomepageBrandLogos() {
  const brandsWithLogos = mainBrands
    .map(brand => ({
      name: brand,
      slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      logo: getBrandLogo(brand)
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
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-60px * ${brandsWithLogos.length} - 40px * ${brandsWithLogos.length}));
          }
        }
        .brand-logos-container {
          display: block !important;
        }
        @media (max-width: 768px) {
          .brand-logos-container {
            display: none !important;
          }
        }
        .brand-logos-inner {
          max-width: 1400px;
          width: calc(100% - 80px);
          margin: 0 auto;
          overflow: hidden;
        }
        @media (min-width: 1536px) {
          .brand-logos-inner {
            max-width: 90% !important;
          }
        }
        .marquee-track {
          display: flex;
          align-items: center;
          gap: 40px;
          width: max-content;
          animation: marquee-scroll 25s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .brand-logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0.7;
          filter: grayscale(20%);
          transition: filter 0.3s ease, transform 0.2s ease, opacity 0.2s ease;
        }
        .brand-logo-link:hover {
          filter: grayscale(0%);
          transform: scale(1.15);
          opacity: 1;
        }
      `}</style>
      <div className="brand-logos-container" style={{
        width: '100%',
        paddingTop: '8px',
        paddingBottom: '8px',
        backgroundColor: 'transparent',
        marginTop: '-15px',
        marginBottom: '0',
        overflow: 'hidden'
      }}>
        <div className="brand-logos-inner" style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}>
          <div className="marquee-track">
            {duplicatedBrands.map((brand, index) => (
              <Link
                key={`${brand.slug}-${index}`}
                href={`/brand/${brand.slug}`}
                className="brand-logo-link"
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
