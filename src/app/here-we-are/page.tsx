import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Here We Are - Nicotine Pouches UK | Our Story & Mission',
  description: 'Discover our story, mission, and commitment to providing the best nicotine pouches comparison service in the UK.',
  openGraph: {
    title: 'Here We Are - Nicotine Pouches UK | Our Story & Mission',
    description: 'Discover our story, mission, and commitment to providing the best nicotine pouches comparison service in the UK.',
    type: 'website',
    url: 'https://nicotine-pouches.org/here-we-are',
  },
  alternates: {
    canonical: 'https://nicotine-pouches.org/here-we-are',
  },
};

export default function HereWeArePage() {
  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />

        <main style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          {/* Hero Section */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px 20px 32px 20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Breadcrumb */}
            <nav style={{
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <Link href="/" style={{
                color: '#1f2937',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '400'
              }}>Start</Link>
              <span style={{
                margin: '0 10px',
                color: '#9ca3af',
                fontSize: '15px'
              }}>/</span>
              <span style={{
                color: '#6b7280',
                fontSize: '15px'
              }}>Here We Are</span>
            </nav>

            {/* Title */}
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              letterSpacing: '-0.5px',
              lineHeight: '1.1'
            }}>
              Here We Are
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '17px',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0',
              lineHeight: '1.7',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Our story, mission, and commitment to revolutionizing nicotine pouches comparison in the UK.
            </p>
          </div>

          {/* Content Section */}
          <div style={{
            backgroundColor: '#f4f5f9',
            padding: '48px 20px'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              {/* Our Story */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '12px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 16px 0',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  Our Story
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#4b5563',
                  lineHeight: '1.7',
                  margin: '0 0 16px 0',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  Nicotine Pouches was born from a simple yet powerful idea: to make finding the best nicotine pouches in the UK as easy as possible.
                </p>
                <p style={{
                  fontSize: '15px',
                  color: '#4b5563',
                  lineHeight: '1.7',
                  margin: '0',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  We recognized that consumers were struggling to navigate through countless suppliers, each with different prices, brands, and offers. Our founders set out to create a platform that would level the playing field.
                </p>
              </div>

              {/* Our Mission */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '12px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 16px 0',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  Our Mission
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#4b5563',
                  lineHeight: '1.7',
                  margin: '0',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  To simplify the nicotine pouches market and empower consumers with transparent, accurate, and up-to-date information. We help thousands of consumers find the best deals every day.
                </p>
              </div>
            </div>
          </div>

          {/* What We Do */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '48px 20px'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 32px 0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                What We Do
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                <div style={{
                  padding: '24px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Compare Prices
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    We aggregate prices from all major UK suppliers to show you the best deals available.
                  </p>
                </div>

                <div style={{
                  padding: '24px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Review Products
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Our team tests and reviews products to provide honest, unbiased information.
                  </p>
                </div>

                <div style={{
                  padding: '24px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Guide Decisions
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    We provide comprehensive guides and comparisons to help you choose.
                  </p>
                </div>

                <div style={{
                  padding: '24px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Save Money
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Our platform helps you find the best deals and save money on every purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div style={{
            backgroundColor: '#f4f5f9',
            padding: '48px 20px'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 32px 0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                Our Values
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '28px',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Transparency
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    All our data is sourced directly from suppliers, and we clearly show where information comes from.
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '28px',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Speed
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    We update our prices and product information in real-time, ensuring you always have current data.
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '28px',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    Trust
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    We're committed to building trust through accurate information and reliable service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* UK Cities Coverage */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '48px 20px'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                We Cover All UK Cities
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#6b7280',
                margin: '0 0 32px 0',
                maxWidth: '700px',
                lineHeight: '1.6',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                Find local nicotine pouches deals and comparisons in every major city across the United Kingdom.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '10px',
                marginBottom: '32px'
              }}>
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
                  { name: 'Brighton', slug: 'brighton-and-hove' },
                  { name: 'Cambridge', slug: 'cambridge' },
                  { name: 'Canterbury', slug: 'canterbury' },
                  { name: 'Carlisle', slug: 'carlisle' },
                  { name: 'Chelmsford', slug: 'chelmsford' },
                  { name: 'Chester', slug: 'chester' },
                  { name: 'Chichester', slug: 'chichester' },
                  { name: 'Colchester', slug: 'colchester' },
                  { name: 'Derby', slug: 'derby' },
                  { name: 'Derry', slug: 'derry' },
                  { name: 'Doncaster', slug: 'doncaster' },
                  { name: 'Dundee', slug: 'dundee' },
                  { name: 'Durham', slug: 'durham' },
                  { name: 'Exeter', slug: 'exeter' },
                  { name: 'Gloucester', slug: 'gloucester' },
                  { name: 'Hereford', slug: 'hereford' },
                  { name: 'Inverness', slug: 'inverness' },
                  { name: 'Hull', slug: 'kingston-upon-hull' },
                  { name: 'Lancaster', slug: 'lancaster' },
                  { name: 'Lincoln', slug: 'lincoln' },
                  { name: 'Milton Keynes', slug: 'milton-keynes' },
                  { name: 'Newport', slug: 'newport' },
                  { name: 'Oxford', slug: 'oxford' },
                  { name: 'Perth', slug: 'perth' },
                  { name: 'Peterborough', slug: 'peterborough' },
                  { name: 'Portsmouth', slug: 'portsmouth' },
                  { name: 'Preston', slug: 'preston' },
                  { name: 'Salford', slug: 'salford' },
                  { name: 'Salisbury', slug: 'salisbury' },
                  { name: 'St Albans', slug: 'st-albans' },
                  { name: 'Stirling', slug: 'stirling' },
                  { name: 'Stoke-on-Trent', slug: 'stoke-on-trent' },
                  { name: 'Sunderland', slug: 'sunderland' },
                  { name: 'Wakefield', slug: 'wakefield' },
                  { name: 'Winchester', slug: 'winchester' },
                  { name: 'Wolverhampton', slug: 'wolverhampton' },
                  { name: 'Worcester', slug: 'worcester' },
                  { name: 'Lisburn', slug: 'lisburn' },
                  { name: 'Newry', slug: 'newry' },
                  { name: 'Armagh', slug: 'armagh' },
                  { name: 'Bangor (Wales)', slug: 'bangor-wales' },
                  { name: 'Bangor (NI)', slug: 'bangor-northern-ireland' },
                  { name: 'St Davids', slug: 'st-davids' },
                  { name: 'St Asaph', slug: 'st-asaph' },
                  { name: 'Wells', slug: 'wells' },
                  { name: 'Ripon', slug: 'ripon' },
                  { name: 'Ely', slug: 'ely' },
                  { name: 'Truro', slug: 'truro' },
                  { name: 'Lichfield', slug: 'lichfield' },
                  { name: 'Dunfermline', slug: 'dunfermline' },
                  { name: 'City of London', slug: 'city-of-london' },
                  { name: 'Westminster', slug: 'city-of-westminster' },
                  { name: 'Southend-on-Sea', slug: 'southend-on-sea' },
                  { name: 'Wrexham', slug: 'wrexham' }
                ].map((city) => (
                  <a
                    key={city.slug}
                    href={`/${city.slug}`}
                    style={{
                      display: 'block',
                      padding: '10px 14px',
                      backgroundColor: '#f9fafb',
                      color: '#1f2937',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'center',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {city.name}
                  </a>
                ))}
              </div>

              <div style={{
                backgroundColor: '#f9fafb',
                padding: '24px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '15px',
                  color: '#4b5563',
                  margin: '0 0 12px 0',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  Don't see your city? Contact us to request coverage for your area.
                </p>
                <a
                  href="/contact-us"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}
                >
                  Request Coverage
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            backgroundColor: '#1f2937',
            padding: '48px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 16px 0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                Ready to Find Your Perfect Nicotine Pouches?
              </h2>
              <p style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 24px 0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                Join thousands of satisfied customers who trust us to help them find the best deals.
              </p>
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link
                  href="/compare"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}
                >
                  Compare Products
                </Link>
                <Link
                  href="/contact-us"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
