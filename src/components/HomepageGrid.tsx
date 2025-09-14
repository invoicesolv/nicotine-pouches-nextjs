'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const HomepageGrid = () => {
  const { getLocalizedPath, isUSRoute } = useLanguage();
  
  return (
    <main id="main" className="clearfix width-100">
      <div className="fusion-row" style={{ maxWidth: '100%' }}>
        <section id="content" className="full-width">
          <div className="post-content">
            
            {/* Container with proper background */}
            <div style={{
              background: 'linear-gradient(180deg, #f2f3f5 0%, rgba(255,255,255,0) 100%)',
              padding: '25px',
              minHeight: '100vh',
              position: 'relative',
              width: '100vw',
              marginLeft: 'calc(50% - 50vw)',
              marginRight: 'calc(50% - 50vw)'
            }}>
              
              {/* Grid Container */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gridTemplateRows: 'auto auto',
                gap: '20px',
                width: '100%',
                maxWidth: 'none',
                margin: '0',
                position: 'relative',
                padding: '0 20px',
                minHeight: 'calc(100vh - 100px)'
              }}>
                
                {/* Main Hero Card - Nicotine Pouches UK/US */}
                <div className="card-enhanced hover-lift transition-smooth" style={{
                  gridColumn: '1 / 3',
                  gridRow: '1',
                  background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url('${isUSRoute ? '/product-images/us/premium_photo-1673266203191-bb6471c95268.png' : 'https://gianna.templweb.com/wp-content/uploads/2025/08/dixit-dhinakaran-E11aaKXGtas-unsplash-1-scaled.webp'}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  borderRadius: '24px',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '400px',
                  position: 'relative'
                }}>
                  <h1 style={{
                    color: 'white',
                    fontSize: 'clamp(32px, 4vw, 64px)',
                    fontWeight: 'bold',
                    lineHeight: '0.9',
                    margin: '0 0 10px 0',
                  }}>
                    Nicotine<br />Pouches {isUSRoute ? 'US' : 'UK'}
                  </h1>
                  
                  <p style={{
                    color: 'white',
                    fontSize: 'clamp(18px, 2.5vw, 32px)',
                    lineHeight: '1.1',
                    margin: '0 0 30px 0',
                  }}>
                    All {isUSRoute ? 'US' : ''} vendors in one place
                  </p>
                  
                  <Link href={getLocalizedPath('/compare')} 
                        style={{
                          background: 'white',
                          color: 'black',
                          padding: '12px 24px',
                          borderRadius: '25px',
                          fontSize: '16px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'inline-block',
                          width: 'fit-content',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                    Compare prices
                  </Link>
                </div>

                {/* Feeling Strong Card - Top Right with Product */}
                <Link href={getLocalizedPath('/compare?filter=strong')} style={{ 
                  textDecoration: 'none',
                  gridColumn: '3',
                  gridRow: '1',
                  display: 'block'
                }}>
                  <div className="card-enhanced hover-lift transition-smooth" style={{
                    background: `url('${isUSRoute ? '/product-images/us/alp-png.jpg' : 'https://gianna.templweb.com/wp-content/uploads/2025/07/norcic-spriti-nicotine-pouches.jpg'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    borderRadius: '24px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '400px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0',
                    zIndex: 2,
                    position: 'relative'
                  }}>
                    Feeling strong?
                  </h3>
                  
                  {/* Product image */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    width: '120px',
                    height: '120px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(45deg, #0066cc 0%, #004499 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {isUSRoute ? 'ALP' : 'NC'}
                    </div>
                  </div>
                </div>
                </Link>

                {/* ZYN Card */}
                <Link href={getLocalizedPath('/compare?brand=zyn')} style={{ 
                  textDecoration: 'none',
                  gridColumn: '4',
                  gridRow: '1',
                  display: 'block'
                }}>
                  <div className="zyn card-enhanced hover-lift transition-smooth" style={{
                    background: `url('${isUSRoute ? '/product-images/us/zyn-us.jpg' : 'https://gianna.templweb.com/wp-content/uploads/2025/07/zyn-1-1.jpg'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                    borderRadius: '24px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    minHeight: '830px',
                    position: 'absolute',
                    width: '380px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                  <h2 style={{
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '0',
                    lineHeight: '1.2',
                  }}>
                    Trending {isUSRoute ? 'US' : 'UK'}<br />
                    Nicotine Pouches
                  </h2>
                </div>
                </Link>

                {/* Second Row - Become a creator (split into two equal cards) */}
                <div className="card-enhanced hover-lift transition-smooth" style={{
                  gridColumn: '1',
                  gridRow: '2',
                  background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url('${isUSRoute ? '/product-images/us/andres-mfWsMDdN-Ro-unsplash-1-scaled.jpg' : 'https://gianna.templweb.com/wp-content/uploads/2024/06/andres-mfWsMDdN-Ro-unsplash-1-scaled.jpg'}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  borderRadius: '24px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  minHeight: '200px',
                  cursor: 'pointer'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '500',
                    margin: '0',
                  }}>
                    Become a creator
                  </h3>
                </div>

                {/* Join Community card with VELO product */}
                <a 
                  href="https://x.com/i/communities/1966801051694121153/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="card-enhanced hover-lift transition-smooth"
                  style={{
                    gridColumn: '2',
                    gridRow: '2',
                    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    borderRadius: '24px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    minHeight: '200px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '500',
                    margin: '0',
                    zIndex: 2
                  }}>
                    Join Community
                  </h3>
                  
                  {/* VELO Product */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    right: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(45deg, #1a365d 0%, #2d3748 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        marginBottom: '2px'
                      }}>VELO</div>
                      <div style={{
                        fontSize: '8px',
                        textTransform: 'uppercase'
                      }}>{isUSRoute ? 'CITRUS MINT' : 'CRISPY PEPPERMINT'}</div>
                      
                      {/* Dots */}
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '3px'
                      }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: i <= 3 ? 'white' : 'rgba(255,255,255,0.3)'
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>

                {/* Compare prices with ON! product */}
                <Link href={getLocalizedPath('/compare')} style={{ 
                  textDecoration: 'none',
                  gridColumn: '3',
                  gridRow: '2',
                  display: 'block'
                }}>
                  <div style={{
                    background: `url('${isUSRoute ? '/product-images/us/rouge.jpg' : 'https://gianna.templweb.com/wp-content/uploads/2025/07/on.jpg'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    borderRadius: '24px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '400px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0',
                    zIndex: 2
                  }}>
                    Compare prices
                  </h3>
                  
                  {/* ON! Product */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-25px',
                    right: '-25px',
                    width: '120px',
                    height: '120px',
                    background: '#ff6b35',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-15deg)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{
                      color: 'white',
                      fontSize: '32px',
                      fontWeight: '900',
                      transform: 'rotate(15deg)'
                    }}>
                      {isUSRoute ? 'ROGUE' : 'on!'}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(15deg)',
                      background: 'white',
                      color: '#ff6b35',
                      fontSize: '8px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      {isUSRoute ? 'WINTERGREEN' : 'ISLAND TWIST'}
                    </div>
                  </div>
                </div>
                </Link>



              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
};

export default HomepageGrid;
