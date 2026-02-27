'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ClientSignupForm from './ClientSignupForm';

const Footer = () => {
  const pathname = usePathname();
  const isUSRoute = pathname?.startsWith('/us');
  const prefix = isUSRoute ? '/us' : '';

  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: 'white', width: '100%' }}>
      {/* Newsletter Section */}
      <div style={{
        padding: '50px 20px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="footer-newsletter-title" style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            color: 'white',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            letterSpacing: '-0.5px'
          }}>
            Subscribe to our newsletter
          </h2>
          <p className="footer-newsletter-text" style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 28px 0',
            lineHeight: '1.6',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            Easily keep up with the latest with Nicotine Pouches. We handpick the best in product news, trends and store deals.
          </p>

          <ClientSignupForm
            source="footer"
            placeholder="Your email*"
            buttonText="→"
          />
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{
        padding: '50px 20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="footer-grid" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 1.3fr) repeat(3, 1fr)',
          gap: '40px'
        }}>

          {/* Company Info */}
          <div className="footer-company-info">
            <div style={{ marginBottom: '16px' }}>
              <Image
                src="/product-images/us/logowhite.png"
                alt="Nicotine Pouches Logo"
                width={200}
                height={54}
                style={{
                  height: 'auto',
                  width: 'auto'
                }}
              />
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              lineHeight: '1.7',
              fontSize: '15px',
              margin: '0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              {isUSRoute
                ? "Nicotine Pouches is an independent comparison service that reviews nicotine pouch prices across the United States. Our business idea is straightforward; we are experts on nicotine pouches and aim to simplify the process for you to navigate through suppliers so you can find the best deal."
                : "Nicotine Pouches is an independent comparison service that reviews all of the United Kingdom's prices on nicotine pouches. Our business idea is straightforward; we are experts on nicotine pouches and aim to simplify the process for you to navigate through suppliers so you can find the best deal."}
            </p>
          </div>

          {/* Column 1 - Nicotine Pouches */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Nicotine Pouches
            </h3>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {[
                { href: `${prefix}/about-us`, label: 'About us' },
                { href: `${prefix}/contact-us`, label: 'Contact us' },
                { href: `${prefix}/careers`, label: 'Careers' },
                { href: `${prefix}/sustainability`, label: 'Sustainability' },
                { href: `${prefix}/work-with-us`, label: 'Work with us' },
                ...(!isUSRoute ? [{ href: '/here-we-are', label: 'Here We Are' }] : [])
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '8px' }}>
                  <Link href={link.href} style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    transition: 'color 0.2s ease'
                  }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 - Learn more */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Learn more
            </h3>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {[
                { href: `${prefix}/how-to-use`, label: 'Getting started' },
                { href: `${prefix}/brands`, label: 'Brands' },
                { href: `${prefix}/guides`, label: 'Guides' },
                ...(!isUSRoute ? [{ href: '/blog', label: 'Blog' }] : []),
                { href: `${prefix}/safe-online-shopping`, label: 'Safe online shopping' },
                { href: `${prefix}/become-a-member`, label: 'Membership' },
                { href: `${prefix}/frequently-asked-questions`, label: 'FAQ' },
                { href: `${prefix}/terms-and-conditions`, label: 'Terms & conditions' },
                { href: `${prefix}/privacy-policy`, label: 'Privacy policy' },
                ...(!isUSRoute ? [{ href: '/digital-services-act', label: 'Digital Services Act' }] : [])
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <Link href={link.href} style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    transition: 'color 0.2s ease'
                  }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Business */}
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Business
            </h3>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {[
                { href: `${prefix}/why-nicotine-pouches`, label: 'Why Nicotine Pouches?' },
                { href: '/dashboard', label: 'Register your store' },
                { href: '/dashboard', label: 'Login for stores' },
                { href: '/dashboard', label: 'Register your brand' },
                { href: '/dashboard', label: 'Login for brands' },
                { href: '#', label: 'Advertise with us' },
                { href: `${prefix}/nicotine-pouches-api`, label: 'Nicotine Pouches API' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <Link href={link.href} style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    transition: 'color 0.2s ease'
                  }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Popular Locations Section - UK Only */}
      {!isUSRoute && (
        <div style={{
          padding: '30px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Popular Locations
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 16px'
            }}>
              {[
                { href: '/london', label: 'London' },
                { href: '/birmingham', label: 'Birmingham' },
                { href: '/manchester', label: 'Manchester' },
                { href: '/glasgow', label: 'Glasgow' },
                { href: '/liverpool', label: 'Liverpool' },
                { href: '/edinburgh', label: 'Edinburgh' },
                { href: '/leeds', label: 'Leeds' },
                { href: '/sheffield', label: 'Sheffield' },
                { href: '/bristol', label: 'Bristol' },
                { href: '/cardiff', label: 'Cardiff' },
                { href: '/belfast', label: 'Belfast' },
                { href: '/nottingham', label: 'Nottingham' },
                { href: '/newcastle', label: 'Newcastle' },
                { href: '/southampton', label: 'Southampton' },
                { href: '/brighton-and-hove', label: 'Brighton' },
                { href: '/cambridge', label: 'Cambridge' },
                { href: '/oxford', label: 'Oxford' },
                { href: '/york', label: 'York' },
                { href: '/bath', label: 'Bath' },
                { href: '/coventry', label: 'Coventry' },
                { href: '/leicester', label: 'Leicester' },
                { href: '/portsmouth', label: 'Portsmouth' },
                { href: '/plymouth', label: 'Plymouth' },
                { href: '/derby', label: 'Derby' },
                { href: '/swansea', label: 'Swansea' },
                { href: '/aberdeen', label: 'Aberdeen' },
                { href: '/dundee', label: 'Dundee' },
                { href: '/inverness', label: 'Inverness' },
                { href: '/lisburn', label: 'Lisburn' },
                { href: '/newry', label: 'Newry' },
                { href: '/armagh', label: 'Armagh' },
                { href: '/bangor-wales', label: 'Bangor (Wales)' },
                { href: '/bangor-northern-ireland', label: 'Bangor (NI)' },
                { href: '/derry', label: 'Derry' },
                { href: '/truro', label: 'Truro' },
                { href: '/wells', label: 'Wells' },
                { href: '/ripon', label: 'Ripon' },
                { href: '/ely', label: 'Ely' },
                { href: '/st-davids', label: 'St Davids' },
                { href: '/st-asaph', label: 'St Asaph' },
                { href: '/lichfield', label: 'Lichfield' },
                { href: '/dunfermline', label: 'Dunfermline' },
                { href: '/city-of-london', label: 'City of London' },
                { href: '/city-of-westminster', label: 'Westminster' },
                { href: '/southend-on-sea', label: 'Southend-on-Sea' },
                { href: '/wrexham', label: 'Wrexham' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    transition: 'color 0.2s ease'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <div className="footer-bottom" style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>
          Copyright 2026 Nicotine Pouches
        </span>

        <div className="footer-social" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            Follow us
          </span>

          {/* X/Twitter */}
          <a
            href="https://x.com/nicotinepouchuk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/nicotinepouchesorg/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=61584629112745"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Scroll to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '8px'
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
