'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import HeroSearchBar from './HeroSearchBar';

const HomepageGrid = () => {
  const { isUSRoute } = useLanguage();
  
  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: 'Klarna Text';
          src: url('/fonts/Klarna-Text-normal-400-100.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
        
        @font-face {
          font-family: 'Klarna Text';
          src: url('/fonts/Klarna-Text-normal-500-100.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        
        @font-face {
          font-family: 'Klarna Text';
          src: url('/fonts/Klarna-Text-normal-700-100.ttf') format('truetype');
          font-weight: 700;
          font-style: normal;
        }
        
        .pricerunner-hero {
          background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), 
                      url('/big-ben.png');
          background-size: cover;
          background-position: center center;
          min-height: 500px;
          max-height: 600px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          width: 92%;
          min-width: 600px;
          max-width: 1500px;
          margin: 40px auto;
          border-radius: 24px;
          padding-left: 60px;
        }
        
        .hero-content {
          text-align: left;
          max-width: 600px;
          padding: 40px 30px;
          width: 100%;
        }
        
        .hero-content h1 {
          color: white;
          font-family: 'Klarna Text', sans-serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          line-height: 1.1;
          margin: 0 0 15px 0;
        }
        
        .hero-content h2 {
          color: white;
          font-family: 'Klarna Text', sans-serif;
          font-size: clamp(18px, 2.5vw, 28px);
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 10px 0;
        }
        
        .hero-content p {
          color: rgba(255,255,255,0.9);
          font-family: 'Klarna Text', sans-serif;
          font-size: clamp(14px, 1.8vw, 16px);
          line-height: 1.4;
          margin: 0 0 30px 0;
        }
        
        @media (max-width: 768px) {
          .pricerunner-hero {
            min-height: 400px;
            max-height: 500px;
            margin: 20px auto;
            border-radius: 16px;
            width: 95%;
            min-width: 300px;
            max-width: 98%;
            padding-left: 30px;
          }
          
          .hero-content {
            padding: 30px 20px;
            max-width: 500px;
          }
          
          .hero-content h1 {
            font-size: clamp(24px, 6vw, 32px);
            margin-bottom: 10px;
          }
          
          .hero-content h2 {
            font-size: clamp(16px, 4vw, 20px);
            margin-bottom: 8px;
          }
          
          .hero-content p {
            font-size: clamp(12px, 3vw, 14px);
            margin-bottom: 25px;
          }
        }
      `}</style>
      <main id="main" className="clearfix width-100">
      <div className="fusion-row" style={{ maxWidth: '100%', width: '100%' }}>
        <section id="content" className="full-width" style={{ width: '100%' }}>
          <div className="post-content" style={{ width: '100%' }}>
            
            {/* PriceRunner-Style Hero Section */}
            <div className="pricerunner-hero">
              <div className="hero-content">
                <h1>
                  {isUSRoute ? 'Nicotine Pouches US' : 'Nicotine Pouches UK'}
                </h1>
                
                <h2>
                  Search, compare, save - Find your next deal today
                </h2>
                
                <p>
                  Compare prices on nicotine pouches from all {isUSRoute ? 'US' : 'UK'} vendors
                </p>
                
                <HeroSearchBar />
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
    </>
  );
};

export default HomepageGrid;