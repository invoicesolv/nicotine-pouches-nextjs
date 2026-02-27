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
                lineHeight: '1.2',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
              }}>
                Find the best deals on 700+ nicotine pouches
              </h2>
            </div>
            <div className="fusion-text fusion-text-20 mobile-text" style={{ textAlign: 'left', fontSize: '18px' }}>
              <p style={{
                color: '#666',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
              }}>
                We compare prices from 10+ UK shops so you always <strong>buy from the cheapest retailer</strong>. ZYN, VELO, Nordic Spirit, Pablo and more - all in one place. Shop smart and save money on every order.
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
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  How to buy cheap nicotine pouches
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  We track prices across 10+ UK shops daily so you can <strong>buy nicotine pouches</strong> at the best price. Search for any product, <strong>compare nicotine pouch prices</strong>, and order from the cheapest retailer.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  We pull deals from shops like Snusifer, Haypp, Northerner and others. Pick a product, see who has the <strong>best nicotine pouch deals UK</strong>, and buy directly from the shop. You pay the same price - we earn a small commission.
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
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Shop 700+ products from top brands
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Buy VELO, ZYN, Nordic Spirit</strong> and more at the cheapest prices. Online shops often have better deals than supermarkets, plus a wider range including <strong>Pablo, Killa, and Siberia nicotine pouches</strong>.
                </p>
                <ul style={{
                  color: '#666',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                  margin: '0 0 20px 0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <li style={{ marginBottom: '10px' }}>
                    Order slim format for a more comfortable fit
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    Shop regular (6-12mg) or strong (12-20mg) options
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    Mint flavours offer the best deals and selection
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    Buy cans with 20-24 pouches at bulk discount prices
                  </li>
                </ul>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Use our filters to find the best deals by strength, flavour, or brand.
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
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Save money on every order
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0 0 20px 0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  The same can of VELO can cost £3.50 at one shop and £5.99 at another. Shops run different deals and <strong>bulk discounts on nicotine pouches</strong> that change weekly. Comparing before you buy saves money - that's why 10,000+ shoppers use our <strong>nicotine pouch price comparison</strong>.
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
                      margin: '0',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      Quick tips
                    </h4>
                  </div>
                  <ol style={{
                    color: '#666',
                    lineHeight: '1.6',
                    paddingLeft: '0',
                    margin: '0',
                    listStyle: 'none',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                  }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>1.</span>
                      <span>Order 10 cans to get bulk deals - save 30-40% per can</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>2.</span>
                      <span>Shop orders over £30-40 for free delivery</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>3.</span>
                      <span>Sign up for deal alerts - we'll email you when prices drop</span>
                    </li>
                    <li style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#333' }}>4.</span>
                      <span>Compare multiple shops - find the best deals and buy at the lowest price</span>
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
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Fast delivery when you order
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Order from <strong>UK nicotine pouch shops</strong> for 1-3 day delivery. European shops like Snusifer ship in 3-5 days but often have the <strong>cheapest nicotine pouches</strong> with bulk deals. We show shipping info so you can buy with confidence.
                </p>
              </div>

              {/* Start Saving Section */}
              <div className="fusion-text fusion-text-26" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-4" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Start shopping for the best deals
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0 0 30px 0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Search for a brand or flavour above, compare prices, and <strong>buy nicotine pouches online</strong> from the cheapest shop. Prices updated daily - never overpay for <strong>nicotine pouches UK</strong> again.
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

              {/* Legal Section - Informational Intent */}
              <div className="fusion-text fusion-text-27" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-5" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Are nicotine pouches legal in the UK?
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Yes. <strong>Nicotine pouches are legal in the UK</strong> because they contain no tobacco. Snus, which does contain tobacco, has been banned here since 1992.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Right now there's no legal age restriction, though most shops check ID anyway. There's also <strong>no cap on nicotine content</strong> - pouches range from 2mg to 150mg. And unlike vapes, they won't be hit by the October 2026 Vape Duty. You just pay standard 20% VAT.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  That said, regulation is coming. The Tobacco and Vapes Bill working through Parliament will make 18+ mandatory, restrict marketing aimed at kids, and give the government power to limit nicotine levels.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Are they safe?</strong> Current research suggests they're less harmful than cigarettes, but there aren't many long-term studies yet.
                </p>
              </div>

              {/* VELO vs ZYN Section - Commercial Intent */}
              <div className="fusion-text fusion-text-28" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-6" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  VELO vs ZYN: Which one?
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  These two dominate the <strong>UK nicotine pouch market</strong>. Quick breakdown:
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>VELO</strong> starts at £5/can. Strengths go up to 17mg, with 20+ flavours. The pouches are moister and hit faster.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>ZYN</strong> runs about £6.50/can. Strengths top out at 11mg, with around 10 flavours. Drier pouches, more gradual release, sits more comfortably.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  VELO makes sense if you want stronger options, fruitier flavours, or the lower price. ZYN works better if you're new to pouches (it starts at 3mg), prefer something discreet, or stick to mint and citrus.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Both are made by tobacco companies - VELO by BAT, ZYN by Philip Morris. Compare prices above to see who has the best deal.
                </p>
              </div>

              {/* Other Brands Section - Transactional Intent */}
              <div className="fusion-text fusion-text-29" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-7" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Other brands worth trying in 2026
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Nordic Spirit</strong> - The one you'll find in Tesco and Sainsbury's. Mint-focused, 6-11mg range. Handy when you need to grab a can in person.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Pablo nicotine pouches</strong> - High-strength stuff, up to 50mg. Skip this one if you're starting out.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Killa pouches</strong> - Similar strengths to Pablo but cheaper. Does interesting flavours like Cola and Watermelon.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Siberia snus</strong> - The "red can" that people either love or regret. Up to 43mg. You've been warned.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>XQS pouches</strong> - Swedish brand with oddball flavours (Blueberry Mint, Tropical). Slim format. Mid-range strength.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Übbs</strong> - UK brand trying something different with modern flavour profiles. Good if mint bores you.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  We track all these across 10+ shops. Search above to <strong>compare nicotine pouch prices</strong>.
                </p>
              </div>

              {/* How to Use Section */}
              <div className="fusion-text fusion-text-30" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-8" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  How to use nicotine pouches
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Never used one before? It's simple. Take a pouch from the can, <strong>place it under your upper lip</strong>, and leave it there. The nicotine absorbs through your gum lining directly into your bloodstream. No smoke, no vapour, no spitting.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  You'll feel a slight tingle when you first put it in. That's normal and usually fades after 10-15 minutes. Most pouches <strong>last 20-30 minutes</strong> before the flavour and nicotine wear off.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Tips for beginners:</strong> Don't chew the pouch. Don't swallow it. Start with a lower strength (3-6mg) and work up if needed. If the tingling feels too strong, try a milder brand or take it out earlier.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  When you're done, put the used pouch in the compartment on top of the can lid. Most cans have a built-in disposal section. Then bin it when you get the chance.
                </p>
              </div>

              {/* Strength Guide Section */}
              <div className="fusion-text fusion-text-31" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-9" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Nicotine pouch strength guide
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Nicotine strength</strong> is measured in milligrams (mg) per pouch. The higher the number, the stronger the hit. Here's a rough guide:
                </p>
                <ul style={{
                  color: '#666',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                  margin: '0 0 20px 0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>2-4mg (Low)</strong> - Good for beginners or light smokers. Subtle effect.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>5-8mg (Regular)</strong> - The most popular range. Works for most people switching from cigarettes or vapes.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>9-12mg (Strong)</strong> - For heavier smokers or those who've built up tolerance.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>13-20mg (Extra Strong)</strong> - Experienced users only. Brands like VELO Max and some Pablo options.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <strong>20mg+ (Extreme)</strong> - Siberia territory. Not recommended unless you know what you're doing.
                  </li>
                </ul>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Mint flavours tend to feel stronger than fruit ones at the same mg level because of the cooling sensation. If you're unsure, <strong>start low and work up</strong>. You can always go stronger, but a bad first experience puts people off.
                </p>
              </div>

              {/* Why Switch Section */}
              <div className="fusion-text fusion-text-32" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-10" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Why switch to nicotine pouches?
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Nicotine pouches contain no tobacco</strong> and produce no smoke or vapour. You're not inhaling anything into your lungs. Current research suggests they're less harmful than cigarettes, though long-term data is still limited.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Compared to vaping:</strong> No batteries to charge, no coils to replace, no liquid to refill. You can use them anywhere - offices, planes, cinemas, public transport. Nobody knows you're using one.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Compared to smoking:</strong> No smell on your clothes or breath. No stepping outside in the rain. No ashtrays. No tar, carbon monoxide, or the 7,000+ chemicals in cigarette smoke.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  The trade-off? Nicotine pouches take a few minutes to kick in, while cigarettes and vapes hit almost instantly. Some ex-smokers miss the hand-to-mouth ritual. But if discretion and convenience matter to you, pouches are hard to beat.
                </p>
              </div>

              {/* Popular Flavours Section */}
              <div className="fusion-text fusion-text-33" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-11" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Most popular nicotine pouch flavours
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Mint dominates.</strong> Around 59% of all pouches sold in the UK are mint flavours. Peppermint, spearmint, cool mint, freezing mint - the variations are endless. Mint works because it's refreshing, masks the nicotine taste, and gives that cooling tingle people expect.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Fruit flavours</strong> are the second most popular at around 22% of sales. Berry, citrus, tropical, watermelon - these appeal to people coming from fruity vapes. Brands like Killa and XQS do interesting fruit combinations.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Top sellers in 2026:</strong> VELO Crispy Peppermint and VELO Freezing Peppermint lead the UK market. ZYN Cool Mint is popular for its smoother, more gradual release. Nordic Spirit Mint is what most people grab at the supermarket.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: '0',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  If you're bored of mint, try <strong>citrus flavours</strong> (ZYN Citrus is a classic) or something unusual like coffee, liquorice, or cinnamon. Use our filters above to browse by flavour.
                </p>
              </div>

              {/* How Our Service Works Section */}
              <div className="fusion-text fusion-text-34" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginBottom: '50px'
              }}>
                <h3 id="section-12" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  How our price comparison works
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  We crawl prices from <strong>10+ UK and European nicotine pouch shops</strong> every day. When you search for a product, we show you what each retailer charges so you can pick the cheapest option. Click through to buy directly from the shop - we earn a small commission, you pay the same price.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Set a price target.</strong> Found a product but want to wait for a better deal? Set your target price and we'll email you when any shop drops below it. No more checking every day - we do the work for you.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>Your personal dashboard.</strong> <Link href="/dashboard" style={{ color: '#22c55e', textDecoration: 'underline' }}>Create a free account</Link> to track your favourite products, see price history, and manage your alerts. Get notified when prices drop on the pouches you actually buy.
                </p>

                {/* Feature Box */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '20px',
                  marginTop: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#22c55e',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#333',
                      margin: '0',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                    }}>
                      Price alert features
                    </h4>
                  </div>
                  <ul style={{
                    color: '#666',
                    lineHeight: '1.6',
                    paddingLeft: '20px',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                  }}>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Price drop alerts</strong> - Get emailed when your favourite products go on sale
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Target price alerts</strong> - Set your ideal price and we'll notify you when it's hit
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Back in stock alerts</strong> - Know when sold-out products return
                    </li>
                    <li style={{ marginBottom: '0' }}>
                      <strong>Price history</strong> - See how prices have changed over time before you buy
                    </li>
                  </ul>
                </div>
              </div>

              {/* Become a Vendor Section */}
              <div className="fusion-text fusion-text-35" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <h3 id="section-13" className="mobile-h3" style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px',
                  lineHeight: '1.3',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Are you a nicotine pouch retailer?
                </h3>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  We work with <strong>nicotine pouch shops across the UK and Europe</strong>. If you sell nicotine pouches and want to reach thousands of buyers comparing prices every month, we'd like to hear from you.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  <strong>What you get:</strong> Your products listed on our comparison pages, traffic from buyers ready to purchase, and a dedicated vendor dashboard to track clicks and conversions. We handle the technical integration - you just focus on selling.
                </p>
                <p className="mobile-text" style={{
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '25px',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Already a partner? <Link href="/store" style={{ color: '#22c55e', textDecoration: 'underline' }}>Log in to your vendor portal</Link> to manage your product listings and view analytics.
                </p>
                <div style={{ textAlign: 'left' }}>
                  <Link
                    href="/work-with-us"
                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                    style={{ marginRight: '12px' }}
                  >
                    Become a Vendor
                  </Link>
                  <Link
                    href="/store"
                    className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Vendor Login
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