import Link from 'next/link';
import Image from 'next/image';
import SignupForm from './SignupForm';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: 'white', width: '100%' }}>
      {/* Newsletter Section */}
      <div style={{ 
        padding: '60px 0', 
        textAlign: 'center',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 16px 0',
            color: 'white'
          }}>
            Subscribe to our newsletter
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#ccc', 
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Easily keep up with the latest with Nicotine Pouches. We handpick the best in product news, trends and store deals.
          </p>
          
          {/* Newsletter Form */}
          <SignupForm 
            source="footer"
            placeholder="Your email*"
            buttonText="Submit"
          />
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{ 
        padding: '60px 0',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          gap: '60px',
          flexWrap: 'wrap'
        }}>
          
          {/* Company Info */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ 
              marginBottom: '20px' 
            }}>
              <Image
                src="https://gianna.templweb.com/wp-content/uploads/2024/08/logo-1.png"
                alt="Nicotine Pouches Logo"
                width={200}
                height={54}
                style={{ 
                  height: 'auto',
                  maxHeight: '50px',
                  filter: 'brightness(0) invert(1)' // Makes the logo white
                }}
              />
            </div>
            <p style={{ 
              color: '#ccc', 
              lineHeight: '1.6',
              fontSize: '14px',
              margin: '0'
            }}>
              Nicotine Pouches is an independent comparison service that reviews all of the United Kingdom's prices on nicotine pouches. Our business idea is straightforward; we are experts on nicotine pouches and aim to simplify the process for you to navigate through suppliers so you can find the best deal.
            </p>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            
            {/* Column 1 */}
            <div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold',
                margin: '0 0 16px 0'
              }}>
                Nicotine Pouches
              </h3>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/about-us" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    About us
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/contact-us" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Contact us
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/sustainability" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Sustainability
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/careers" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Work with us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold',
                margin: '0 0 16px 0'
              }}>
                Learn more
              </h3>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/how-to-use" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Getting started
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/safe-online-shopping" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Safe online shopping
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/become-a-member" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Membership
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/frequently-asked-questions" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Frequently asked questions
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/terms-and-conditions" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Policies & privacy
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/terms-and-conditions" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Privacy settings
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/digital-services-act" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Digital Services Act (DSA)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold',
                margin: '0 0 16px 0'
              }}>
                Business
              </h3>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/why-nicotine-pouches" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Why Nicotine Pouches?
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Register your store
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Login for stores
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Register your brand
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Login for brands
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="#" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Advertise with us
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link href="/nicotine-pouches-api" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
                    Nicotine Pouches API
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ 
        padding: '20px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{ color: '#ccc', fontSize: '14px' }}>
          Copyright 2025 Nicotine Pouches
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a 
            href="https://x.com/nicotinepouchuk" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#ccc',
              textDecoration: 'none',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.3s ease'
            }}
            className="hover:text-blue-400"
          >
            <span style={{ fontSize: '18px' }}>𝕏</span>
            Follow us
          </a>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#ccc',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            ×
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#ccc',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            ^
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;