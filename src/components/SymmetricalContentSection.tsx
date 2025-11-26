import Link from 'next/link';
import TableOfContentsWrapper from './TableOfContentsWrapper';

const SymmetricalContentSection = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 768px) {
            .content-layout {
              display: flex !important;
              flex-direction: row !important;
              gap: 40px !important;
            }
            .main-content {
              flex: 2 !important;
            }
            .toc-content {
              flex: 1 !important;
              max-width: 384px !important;
            }
          }
          @media (max-width: 767px) {
            .content-layout {
              display: flex !important;
              flex-direction: column !important;
              gap: 20px !important;
            }
            .main-content {
              width: 100% !important;
              flex: 1 !important;
            }
            .toc-content {
              width: 100% !important;
              flex: 1 !important;
            }
            .mobile-title {
              font-size: 1.5rem !important;
              line-height: 1.3 !important;
            }
            .mobile-text {
              font-size: 14px !important;
              line-height: 1.5 !important;
            }
            .mobile-h3 {
              font-size: 1.2rem !important;
              line-height: 1.3 !important;
            }
          }
        `
      }} />
      <div className="fusion-fullwidth fullwidth-box fusion-builder-row-11 fusion-flex-container has-pattern-background has-mask-background nonhundred-percent-fullwidth non-hundred-percent-height-scrolling" 
           style={{
             width: '100vw',
             marginLeft: 'calc(50% - 50vw)',
             marginRight: 'calc(50% - 50vw)',
             padding: '60px 0',
             backgroundColor: '#ffffff'
           }}>
      <div className="fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-justify-content-center fusion-flex-content-wrap" 
           style={{
             maxWidth: '1400px',
             margin: '0 auto',
             padding: '0 20px'
           }}>
        
        {/* Main Heading Section - Centered Block with Left-Aligned Text */}
        <div className="fusion-layout-column fusion_builder_column fusion-builder-column-35 fusion_builder_column_2_3 2_3 fusion-flex-column" 
             style={{ 
               width: '100%', 
               maxWidth: '800px', 
               margin: '0 auto 40px auto',
               padding: '0 20px'
             }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-text fusion-text-19" style={{ textAlign: 'left' }}>
              <h2 className="mobile-title" style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#333',
                marginBottom: '20px',
                lineHeight: '1.2'
              }}>
                Discover the Best Products with Our Price Comparison Service
              </h2>
            </div>
            <div className="fusion-text fusion-text-20 mobile-text" style={{ textAlign: 'left', fontSize: '18px' }}>
              <p style={{
                color: '#666',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Looking for the top deals on <strong>nicotine pouches UK</strong>? You've come to the right place! At Nicotine Pouches, we're dedicated to helping you find the best prices on premium products, ensuring you get unbeatable value. Whether you're new to these products or a seasoned user, our price comparison platform simplifies your search for affordable, high-quality options across the market.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Content Section with TOC */}
      <div className="fusion-fullwidth fullwidth-box fusion-builder-row-12 fusion-flex-container has-pattern-background has-mask-background nonhundred-percent-fullwidth non-hundred-percent-height-scrolling" 
           style={{
             width: '100vw',
             marginLeft: 'calc(50% - 50vw)',
             marginRight: 'calc(50% - 50vw)',
             padding: '0 0 60px 0',
             backgroundColor: '#ffffff'
           }}>
        <div className="fusion-builder-row fusion-row fusion-flex-align-items-stretch fusion-flex-justify-content-center fusion-flex-content-wrap content-layout" 
             style={{
               maxWidth: '1200px',
               margin: '0 auto',
               padding: '0 20px'
             }}>
          
          {/* Main Content - Full width on mobile, 2/3 on desktop */}
          <div className="fusion-layout-column fusion_builder_column fusion-builder-column-36 fusion_builder_column_2_3 2_3 fusion-flex-column main-content" 
               style={{ 
                 minHeight: '400px',
                 display: 'flex',
                 flexDirection: 'column'
               }}>
            <div className="fusion-column-wrapper" style={{ 
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              
              {/* Compare Prices Section */}
              <div className="fusion-text fusion-text-21" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-0" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left'
                }}>
                  Compare Nicotine Pouches UK Prices Today
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <strong>Nicotine pouches UK</strong> have surged in popularity as a smoke-free, tobacco-free alternative for enthusiasts. Discreet, convenient, and available in a variety of flavors and strengths, these products are perfect for those looking to enjoy nicotine without the hassle of smoking or vaping. From minty freshness to fruity bursts, the market offers something for everyone.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left'
                }}>
                  With our service, you can compare prices on leading brands like VELO, Skruf, and LOOP, ensuring you never overpay for your favorite products. Our comprehensive database covers all major retailers, from established brands to emerging favorites, giving you the power to make informed purchasing decisions.
                </p>
              </div>

              {/* Explore Wide Range Section */}
              <div className="fusion-text fusion-text-22" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-1" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left'
                }}>
                  Explore a Wide Range of Nicotine Pouches UK
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  The UK market is packed with variety. Love a refreshing mint flavor? Try VELO Crispy Peppermint. Craving something fruity? LOOP's offerings might be your go-to. Our price comparison service covers all the top categories, including:
                </p>
                <ul style={{
                  color: '#666',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                  margin: '0 0 20px 0',
                  textAlign: 'left'
                }}>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>Slim Pouches</strong> – Perfect for discreet use.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>Strong Pouches</strong> – For a powerful hit.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>Free Options</strong> – Ideal for cutting down without losing the habit.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>Flavored Varieties</strong> – From coffee to liquorice, explore unique tastes.
                  </li>
                </ul>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left'
                }}>
                  No matter your preference, we help you find the best deals tailored to your needs.
                </p>
              </div>

              {/* Why Choose Section */}
              <div className="fusion-text fusion-text-23" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-2" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left'
                }}>
                  Why Choose Nicotine Pouches UK?
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0 0 20px 0',
                  textAlign: 'left'
                }}>
                  Why spend more when you can save with our expertly curated price comparisons? We scour the web to bring you the latest deals, from slim pouches to extra-strong varieties. Whether you prefer low-strength options or bold, high-strength kicks, our platform lists the best prices from trusted retailers across the UK. Save time and money by letting us do the heavy lifting—finding the cheapest options has never been easier!
                </p>
                
                {/* 6 Reasons Section */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '20px',
                  marginTop: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#333',
                      margin: '0'
                    }}>
                      6 Reasons to Compare Prices & Save Money
                    </h4>
                  </div>
                  <ol style={{
                    color: '#666',
                    lineHeight: '1.6',
                    paddingLeft: '0',
                    margin: '0',
                    listStyle: 'none'
                  }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>1.</span>
                      <span>Save up to 40% on large orders</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>2.</span>
                      <span>Find exclusive bulk discounts and special offers</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>3.</span>
                      <span>Compare prices across trusted UK retailers</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>4.</span>
                      <span>Get free delivery on orders over £30</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>5.</span>
                      <span>Access real-time price updates and alerts</span>
                    </li>
                    <li style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>6.</span>
                      <span>Never overpay for your favorite brands again</span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Fast Delivery Section */}
              <div className="fusion-text fusion-text-24" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-3" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left'
                }}>
                  Nicotine Pouches UK: Fast Delivery, Great Prices
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left'
                }}>
                  Ordering through our platform means you'll enjoy fast, reliable shipping to your door. Many of the retailers we feature offer free delivery on orders above a certain amount, and we make sure you know exactly where to find those perks. From London to Glasgow, get your products delivered quickly and at the lowest possible cost.
                </p>
              </div>

              {/* Start Saving Section */}
              <div className="fusion-text fusion-text-26" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <h3 id="section-4" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left'
                }}>
                  Start Saving on Nicotine Pouches UK Now
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0 0 30px 0',
                  textAlign: 'left'
                }}>
                  Ready to find the best deals? Use our price comparison tool today and discover how much you can save. Whether you're after bestselling products like White Fox or new arrivals like Lynx Cool Mint, we bring you the cheapest options in one convenient place. Don't settle for less—shop smarter with us and make us your number-one stop for premium products.
                </p>
                <div style={{ textAlign: 'left' }}>
                  <Link 
                    href="/compare" 
                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
                  >
                    Compare Prices Now
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Table of Contents - Full width on mobile, 1/3 on desktop */}
          <div className="fusion-layout-column fusion_builder_column fusion-builder-column-37 fusion_builder_column_1_3 1_3 fusion-flex-column toc-content" 
               style={{ 
                 minHeight: 'auto',
                 display: 'flex',
                 flexDirection: 'column'
               }}>
            <div className="fusion-column-wrapper" style={{ 
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <TableOfContentsWrapper />
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default SymmetricalContentSection;