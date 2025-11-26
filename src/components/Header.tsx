'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MegaMenu from './MegaMenu';
import USMegaMenu from './USMegaMenu';
import LiveSearch from './LiveSearch';
import LoginModal from './LoginModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const { user, signOut, loginModalTrigger } = useAuth();
  const { getLocalizedPath, isUSRoute } = useLanguage();
  const pathname = usePathname();
  
  // Check if we're on the homepage
  const isHomepage = pathname === '/' || pathname === '/us';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = (user: any) => {
    console.log('User logged in successfully:', user);
    // The AuthContext will automatically update the user state
  };

  // Listen for global login modal trigger
  useEffect(() => {
    if (loginModalTrigger > 0) {
      setIsLoginModalOpen(true);
    }
  }, [loginModalTrigger]);

  // Listen for custom login modal trigger event
  useEffect(() => {
    const handleTriggerLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('triggerLoginModal', handleTriggerLoginModal);
    
    return () => {
      window.removeEventListener('triggerLoginModal', handleTriggerLoginModal);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav {
            display: flex !important;
          }
          .mobile-left.mobile-nav {
            display: flex !important;
          }
          .mobile-right.mobile-nav {
            display: flex !important;
          }
          .header-container {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 10px 15px !important;
            flex-wrap: nowrap !important;
          }
          .mobile-left {
            flex: 0 0 auto !important;
          }
          .mobile-center {
            flex: 1 !important;
            display: flex !important;
            justify-content: center !important;
          }
          .mobile-right {
            flex: 0 0 auto !important;
          }
          .logo-container {
            flex: none !important;
          }
          .logo-container img {
            max-height: 40px !important;
            width: auto !important;
          }
          .search-container {
            display: none !important;
          }
          .mobile-search {
            display: none !important;
          }
          .mobile-search-icon {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
          .desktop-nav {
            display: flex !important;
          }
          .mobile-search {
            display: none !important;
          }
        }
      `}</style>
      <div className="fusion-tb-header" style={{ width: '100vw' }}>
        <header className="fusion-fullwidth fullwidth-box fusion-builder-row-1 fusion-flex-container has-pattern-background has-mask-background my-sticky-header hundred-percent-fullwidth non-hundred-percent-height-scrolling" 
                style={{ 
                  width: '100vw', 
                  backgroundColor: 'white',
                  padding: '15px 0',
                  borderBottom: '1px solid #f0f0f0',
                  marginLeft: 'calc(50% - 50vw)',
                  marginRight: 'calc(50% - 50vw)',
                  position: 'relative',
                  zIndex: 1000
                }}>
        <div className="fusion-builder-row fusion-row fusion-flex-align-items-center fusion-flex-justify-content-space-between fusion-flex-content-wrap header-container" 
             style={{
               width: '100%',
               maxWidth: 'none',
               margin: '0',
               padding: '0 60px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between'
             }}>
          
          {/* Mobile Left - Hamburger Menu */}
          <div className="mobile-left mobile-nav">
            <button
              onClick={toggleMenu}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#333',
                fontSize: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}
              aria-label="Menu"
            >
              <div style={{
                width: '20px',
                height: '2px',
                backgroundColor: '#333',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }}></div>
              <div style={{
                width: '20px',
                height: '2px',
                backgroundColor: '#333',
                transition: 'all 0.3s ease',
                opacity: isMenuOpen ? 0 : 1
              }}></div>
              <div style={{
                width: '20px',
                height: '2px',
                backgroundColor: '#333',
                transition: 'all 0.3s ease',
                transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
              }}></div>
            </button>
          </div>

          {/* Logo - Center on mobile, left on desktop */}
          <div className="logo-container mobile-center" style={{ flex: '0 0 auto' }}>
            <Link href={isUSRoute ? "/us" : "/"} aria-label="logo">
              <Image
                src="/product-images/us/logo-1.png"
                alt="Nicotine Pouches Logo"
                width={200}
                height={54}
                className="img-responsive"
                priority
                style={{ height: 'auto', maxHeight: '50px' }}
              />
            </Link>
          </div>

          {/* Desktop Live Search Bar - Hidden on homepage */}
          {!isHomepage && (
            <div className="search-container desktop-nav" style={{ flex: '1 1 auto', maxWidth: '400px', margin: '0 30px' }}>
              <LiveSearch />
            </div>
          )}

          {/* Mobile Search Bar - Hidden on homepage */}
          {!isHomepage && (
            <div className="mobile-search">
              <LiveSearch />
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ flex: '0 0 auto', margin: '0 20px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ marginRight: '15px' }}>
                {isUSRoute ? <USMegaMenu /> : <MegaMenu />}
              </div>
              
              {!isUSRoute && (
                <Link href={getLocalizedPath('/guides')} style={{
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                  fontWeight: '500',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  Guides
                </Link>
              )}
              
              <Link href={getLocalizedPath('/how-to-use')} style={{
                color: '#333',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                padding: '10px 15px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                How to use
              </Link>
              
              <Link href="/compare" style={{
                color: '#FD8E98',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                padding: '10px 15px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                Compare
              </Link>
              
              <Link href={getLocalizedPath('/about-us')} style={{
                color: '#333',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                padding: '10px 15px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                About us
              </Link>
              
              {/* Language Switcher */}
              <LanguageSwitcher />
            </nav>
          </div>


            {/* Mobile Right - Search Icon */}
            <div className="mobile-right mobile-nav">
              <button
                onClick={toggleSearch}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#333',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>

            {/* Desktop User Actions */}
            <div className="desktop-nav" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
              {user ? (
                // User is logged in
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link 
                    href="/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span>{user.user_metadata?.name || user.email}</span>
                  </Link>
                  <button 
                    onClick={signOut}
                    style={{
                      background: 'transparent',
                      border: '2px solid #dc2626',
                      color: '#dc2626',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                  >
                    Logout
                  </button>
                </div>
            ) : (
              // User is not logged in
              <button 
                onClick={openLoginModal}
                style={{
                  background: 'transparent',
                  border: '2px solid #198fd9',
                  color: '#198fd9',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#198fd9';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#198fd9';
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: 'white',
            borderBottom: '1px solid #f0f0f0',
            zIndex: 1001,
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '20px' }}>
              {/* Mobile MegaMenu */}
              <div style={{ marginBottom: '20px' }}>
                {isUSRoute ? <USMegaMenu /> : <MegaMenu />}
              </div>

              {/* Mobile Navigation Links */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                {!isUSRoute && (
                  <Link 
                    href={getLocalizedPath('/guides')} 
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '18px',
                      fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                      fontWeight: '500',
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    Guides
                  </Link>
                )}
                
                <Link 
                  href={getLocalizedPath('/how-to-use')} 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  How to use
                </Link>
                
                <Link 
                  href="/compare" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#FD8E98',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  Compare
                </Link>
                
                <Link 
                  href={getLocalizedPath('/about-us')} 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  About us
                </Link>
              </nav>

              {/* Mobile Language Switcher */}
              <div style={{ marginBottom: '20px' }}>
                <LanguageSwitcher />
              </div>

              {/* Mobile User Actions */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                {user ? (
                  // User is logged in
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <Link 
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#374151',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <span>{user.user_metadata?.name || user.email}</span>
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: '2px solid #dc2626',
                        color: '#dc2626',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  // User is not logged in
                  <button 
                    onClick={() => {
                      openLoginModal();
                      setIsMenuOpen(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: '2px solid #198fd9',
                      color: '#198fd9',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      width: '100%'
                    }}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Full Screen Search Overlay */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100vw',
          height: '100vh'
        }}>
          {/* Search Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            {/* Back Button */}
            <button
              onClick={toggleSearch}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#333',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
            
            {/* Search Button */}
            <button
              style={{
                background: '#333',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '10px'
              }}
              aria-label="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 9 3 3 3-3"/>
              </svg>
            </button>
          </div>
          
          {/* Search Results */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <LiveSearch 
              hideInput={true} 
              externalQuery={mobileSearchQuery}
              onQueryChange={setMobileSearchQuery}
            />
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
      </div>
    </>
  );
};

export default Header;
