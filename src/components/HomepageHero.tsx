'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import HeroSearchBar from './HeroSearchBar';
import Image from 'next/image';

const HomepageHero = () => {
  const { isUSRoute } = useLanguage();

  return (
    <>
      <style jsx>{`
        .pricerunner-hero {
          background: #1f2544;
          min-height: 420px;
          display: flex;
          align-items: center;
          position: relative;
          width: 94%;
          max-width: 1400px;
          margin: 25px auto 30px auto;
          border-radius: 32px;
          padding: 60px 70px;
          z-index: 1;
          overflow: hidden;
        }

        .hero-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 40px;
        }

        .hero-content {
          flex: 1;
          text-align: left;
          max-width: 550px;
          z-index: 2;
        }

        .hero-tagline {
          color: white;
          font-family: 'Plus Jakarta Sans', Georgia, serif;
          font-size: clamp(36px, 4.5vw, 52px);
          font-weight: 700;
          font-style: italic;
          line-height: 1.1;
          margin: 0 0 20px 0;
          letter-spacing: -0.5px;
        }

        .hero-tagline-second {
          font-style: normal;
        }

        .hero-subtitle {
          color: rgba(255,255,255,0.85);
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          font-size: clamp(15px, 1.5vw, 18px);
          line-height: 1.6;
          margin: 0 0 32px 0;
          max-width: 420px;
          font-weight: 400;
        }

        .hero-image-container {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          width: 380px;
          height: 420px;
          z-index: 1;
        }

        @media (max-width: 1100px) {
          .pricerunner-hero {
            padding: 50px 50px;
          }

          .hero-image-container {
            width: 320px;
            height: 380px;
            right: 20px;
          }
        }

        @media (max-width: 900px) {
          .pricerunner-hero {
            padding: 40px 35px;
            min-height: 380px;
          }

          .hero-content {
            max-width: 55%;
          }

          .hero-image-container {
            width: 280px;
            height: 340px;
            right: 10px;
          }
        }

        @media (max-width: 700px) {
          .pricerunner-hero {
            width: 96%;
            margin: 15px auto;
            border-radius: 24px;
            padding: 35px 25px;
            min-height: auto;
          }

          .hero-content {
            max-width: 100%;
          }

          .hero-tagline {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 15px;
            max-width: 100%;
          }

          .hero-image-container {
            display: none;
          }
        }
      `}</style>

      <div className="pricerunner-hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-tagline">
              Search, compare, save<br />
              <span className="hero-tagline-second">Find your next deal today</span>
            </h1>

            <p className="hero-subtitle">
              {isUSRoute
                ? 'At NicotinePouches.com you can compare prices on nicotine pouches from 50+ US shops'
                : 'At NicotinePouches.com you can compare prices on nicotine pouches from 30+ UK shops'}
            </p>

            <HeroSearchBar />
          </div>

          <div className="hero-image-container">
            <Image
              src="/hero-phone-mockup.svg"
              alt="Compare nicotine pouch prices on mobile"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomepageHero;
