import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'Here We Are - Nicotine Pouches UK | Our Story & Mission',
  description: 'Discover our story, mission, and commitment to providing the best nicotine pouches comparison service in the UK. Learn about our team and values.',
  keywords: 'nicotine pouches story, our mission, UK comparison service, team values, company history',
  openGraph: {
    title: 'Here We Are - Nicotine Pouches UK | Our Story & Mission',
    description: 'Discover our story, mission, and commitment to providing the best nicotine pouches comparison service in the UK. Learn about our team and values.',
    type: 'website',
    url: 'https://nicotine-pouches.org/here-we-are',
  },
  alternates: {
    canonical: 'https://nicotine-pouches.org/here-we-are',
  },
};

export default function HereWeArePage() {
  return (
    <div id="boxed-wrapper" className="page-transition">
      <div id="wrapper" className="fusion-wrapper">
        
        {/* Header */}
        <Header />
        
        {/* Hero Section */}
        <section className="hero-section" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '100px 0',
          textAlign: 'center',
          color: 'white'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{
              fontSize: 'clamp(48px, 6vw, 72px)',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              lineHeight: '1.1'
            }}>
              Here We Are
            </h1>
            
            <p style={{
              fontSize: 'clamp(20px, 3vw, 28px)',
              margin: '0 auto 30px auto',
              opacity: '0.9',
              maxWidth: '800px'
            }}>
              Our story, mission, and commitment to revolutionizing nicotine pouches comparison in the UK
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section style={{
          padding: '80px 0',
          background: 'white'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '60px',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  color: '#333'
                }}>
                  Our Story
                </h2>
                <p style={{
                  fontSize: '18px',
                  lineHeight: '1.7',
                  color: '#666',
                  marginBottom: '20px'
                }}>
                  Nicotine Pouches was born from a simple yet powerful idea: to make finding the best nicotine pouches 
                  in the UK as easy as possible. We recognized that consumers were struggling to navigate through 
                  countless suppliers, each with different prices, brands, and offers.
                </p>
                <p style={{
                  fontSize: '18px',
                  lineHeight: '1.7',
                  color: '#666',
                  marginBottom: '20px'
                }}>
                  Our founders, passionate about both technology and consumer rights, set out to create a platform 
                  that would level the playing field. We wanted to give every consumer the power to make informed 
                  decisions about their nicotine pouch purchases.
                </p>
                <p style={{
                  fontSize: '18px',
                  lineHeight: '1.7',
                  color: '#666'
                }}>
                  Today, we're proud to be the UK's most comprehensive nicotine pouches comparison service, 
                  helping thousands of consumers find the best deals every day.
                </p>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px'
                }}>
                  🎯
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Our Mission
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  To simplify the nicotine pouches market and empower consumers with transparent, 
                  accurate, and up-to-date information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section style={{
          padding: '80px 0',
          background: '#f8f9fa'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#333'
            }}>
              Our Values
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px'
                }}>
                  🔍
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Transparency
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We believe in complete transparency. All our data is sourced directly from suppliers, 
                  and we clearly show where information comes from.
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px'
                }}>
                  ⚡
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Speed
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We update our prices and product information in real-time, ensuring you always 
                  have the most current data available.
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px'
                }}>
                  🛡️
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Trust
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We're committed to building trust through accurate information, 
                  reliable service, and honest recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section style={{
          padding: '80px 0',
          background: 'white'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#333'
            }}>
              What We Do
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '30px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '30px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Compare Prices
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We aggregate prices from all major UK suppliers to show you the best deals available.
                </p>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '30px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Review Products
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  Our team tests and reviews products to provide honest, unbiased information about quality and value.
                </p>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '30px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Guide Decisions
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We provide comprehensive guides and comparisons to help you make the best choice for your needs.
                </p>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '30px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  4
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: '#333'
                }}>
                  Save Money
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  Our platform helps you find the best deals and save money on every purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section style={{
          padding: '80px 0',
          background: '#f8f9fa'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#333'
            }}>
              Our Team
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  👨‍💼
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#333'
                }}>
                  Our Experts
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  A dedicated team of nicotine pouches experts, data analysts, and consumer advocates 
                  working to provide you with the best possible service.
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  🌍
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#333'
                }}>
                  UK Focus
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We're based in the UK and understand the local market, regulations, and consumer needs 
                  better than anyone else.
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  💡
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#333'
                }}>
                  Innovation
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666'
                }}>
                  We continuously innovate our platform to provide better tools, more accurate data, 
                  and enhanced user experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* UK Cities Coverage Section */}
        <section style={{
          padding: '80px 0',
          background: 'white'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              color: '#333'
            }}>
              We Cover All UK Cities
            </h2>
            <p style={{
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#666',
              maxWidth: '800px',
              margin: '0 auto 60px auto'
            }}>
              Find local nicotine pouches deals and comparisons in every major city across the United Kingdom. 
              Click on any city below to discover local shops, prices, and availability in your area.
            </p>
            
            {/* Cities Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '40px'
            }}>
              {/* Major Cities */}
              {[
                { name: 'London', slug: 'london' },
                { name: 'Manchester', slug: 'manchester' },
                { name: 'Birmingham', slug: 'birmingham' },
                { name: 'Leeds', slug: 'leeds' },
                { name: 'Glasgow', slug: 'glasgow' },
                { name: 'Edinburgh', slug: 'edinburgh' },
                { name: 'Liverpool', slug: 'liverpool' },
                { name: 'Bristol', slug: 'bristol' },
                { name: 'Newcastle', slug: 'newcastle-upon-tyne' },
                { name: 'Sheffield', slug: 'sheffield' },
                { name: 'Nottingham', slug: 'nottingham' },
                { name: 'Leicester', slug: 'leicester' },
                { name: 'Coventry', slug: 'coventry' },
                { name: 'Cardiff', slug: 'cardiff' },
                { name: 'Belfast', slug: 'belfast' },
                { name: 'Plymouth', slug: 'plymouth' },
                { name: 'Southampton', slug: 'southampton' },
                { name: 'Norwich', slug: 'norwich' },
                { name: 'Swansea', slug: 'swansea' },
                { name: 'York', slug: 'york' },
                { name: 'Aberdeen', slug: 'aberdeen' },
                { name: 'Bath', slug: 'bath' },
                { name: 'Bradford', slug: 'bradford' },
                { name: 'Brighton and Hove', slug: 'brighton-and-hove' },
                { name: 'Cambridge', slug: 'cambridge' },
                { name: 'Canterbury', slug: 'canterbury' },
                { name: 'Carlisle', slug: 'carlisle' },
                { name: 'Chelmsford', slug: 'chelmsford' },
                { name: 'Chester', slug: 'chester' },
                { name: 'Chichester', slug: 'chichester' },
                { name: 'City of London', slug: 'city-of-london' },
                { name: 'City of Westminster', slug: 'city-of-westminster' },
                { name: 'Colchester', slug: 'colchester' },
                { name: 'Derby', slug: 'derby' },
                { name: 'Derry', slug: 'derry' },
                { name: 'Doncaster', slug: 'doncaster' },
                { name: 'Dundee', slug: 'dundee' },
                { name: 'Dunfermline', slug: 'dunfermline' },
                { name: 'Durham', slug: 'durham' },
                { name: 'Ely', slug: 'ely' },
                { name: 'Exeter', slug: 'exeter' },
                { name: 'Gloucester', slug: 'gloucester' },
                { name: 'Hereford', slug: 'hereford' },
                { name: 'Inverness', slug: 'inverness' },
                { name: 'Kingston upon Hull', slug: 'kingston-upon-hull' },
                { name: 'Lancaster', slug: 'lancaster' },
                { name: 'Lichfield', slug: 'lichfield' },
                { name: 'Lincoln', slug: 'lincoln' },
                { name: 'Lisburn', slug: 'lisburn' },
                { name: 'Milton Keynes', slug: 'milton-keynes' },
                { name: 'Newport', slug: 'newport' },
                { name: 'Newry', slug: 'newry' },
                { name: 'Oxford', slug: 'oxford' },
                { name: 'Perth', slug: 'perth' },
                { name: 'Peterborough', slug: 'peterborough' },
                { name: 'Portsmouth', slug: 'portsmouth' },
                { name: 'Preston', slug: 'preston' },
                { name: 'Ripon', slug: 'ripon' },
                { name: 'Salford', slug: 'salford' },
                { name: 'Salisbury', slug: 'salisbury' },
                { name: 'Southend-on-Sea', slug: 'southend-on-sea' },
                { name: 'St Albans', slug: 'st-albans' },
                { name: 'St Asaph', slug: 'st-asaph' },
                { name: 'St Davids', slug: 'st-davids' },
                { name: 'Stirling', slug: 'stirling' },
                { name: 'Stoke-on-Trent', slug: 'stoke-on-trent' },
                { name: 'Sunderland', slug: 'sunderland' },
                { name: 'Truro', slug: 'truro' },
                { name: 'Wakefield', slug: 'wakefield' },
                { name: 'Wells', slug: 'wells' },
                { name: 'Winchester', slug: 'winchester' },
                { name: 'Wolverhampton', slug: 'wolverhampton' },
                { name: 'Worcester', slug: 'worcester' },
                { name: 'Wrexham', slug: 'wrexham' },
                { name: 'Armagh', slug: 'armagh' },
                { name: 'Bangor (Wales)', slug: 'bangor-wales' },
                { name: 'Bangor (Northern Ireland)', slug: 'bangor-northern-ireland' }
              ].map((city, index) => (
                <a
                  key={city.slug}
                  href={`https://nicotine-pouches.org/${city.slug}`}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    color: '#333',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e9ecef'
                  }}
                >
                  {city.name}
                </a>
              ))}
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '40px',
              background: '#f8f9fa',
              borderRadius: '12px',
              marginTop: '40px'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#333'
              }}>
                Don't See Your City?
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '20px'
              }}>
                We're constantly expanding our coverage. Contact us to request coverage for your area.
              </p>
              <a
                href="https://nicotine-pouches.org/contact-us"
                style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                Request Coverage
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '80px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textAlign: 'center',
          color: 'white'
        }}>
          <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              Ready to Find Your Perfect Nicotine Pouches?
            </h2>
            <p style={{
              fontSize: '20px',
              marginBottom: '40px',
              opacity: '0.9'
            }}>
              Join thousands of satisfied customers who trust us to help them find the best deals.
            </p>
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="https://nicotine-pouches.org/compare"
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  transition: 'all 0.3s ease'
                }}
              >
                Compare Products
              </a>
              <a
                href="https://nicotine-pouches.org/contact-us"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  border: '2px solid white',
                  transition: 'all 0.3s ease'
                }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
      </div>
    </div>
  );
}
