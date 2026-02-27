'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MegaMenu from './MegaMenu';
import USMegaMenu from './USMegaMenu';
import LiveSearch from './LiveSearch';
import LoginModal from './LoginModal';
import ClientPriceAlertModal from './ClientPriceAlertModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  
  // Get auth context (returns defaults if provider not available)
  const { user, signOut, loginModalTrigger } = useAuth();

  // Get language context (returns defaults if provider not available)
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

  const headerStyles = `
    @media (max-width: 768px) {
      .fusion-tb-header .desktop-nav { display: none !important; }
      .fusion-tb-header .mobile-nav { display: flex !important; }
      .fusion-tb-header .mobile-left.mobile-nav { display: flex !important; }
      .fusion-tb-header .mobile-right.mobile-nav { display: flex !important; }
      .fusion-tb-header .header-container { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 10px 15px !important; flex-wrap: nowrap !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
      .fusion-tb-header .header-inner { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
      .fusion-tb-header .mobile-left { flex: 0 0 auto !important; }
      .fusion-tb-header .mobile-center { flex: 1 !important; display: flex !important; justify-content: center !important; align-items: center !important; }
      .fusion-tb-header .mobile-center img { max-height: 40px !important; width: auto !important; }
      .fusion-tb-header .mobile-right { flex: 0 0 auto !important; }
      .fusion-tb-header .logo-container { flex: none !important; position: static !important; transform: none !important; }
      .fusion-tb-header .logo-container img { max-height: 40px !important; width: auto !important; }
      .fusion-tb-header .search-container { display: none !important; }
      .fusion-tb-header .mobile-search { display: none !important; }
      .fusion-tb-header .mobile-search-icon { display: block !important; }
    }
    .fusion-tb-header .header-container { display: flex; align-items: center; justify-content: space-between; width: 100% !important; }
    .fusion-tb-header .header-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    @media (min-width: 769px) {
      .fusion-tb-header .mobile-nav { display: none !important; }
      .fusion-tb-header .desktop-nav { display: flex !important; }
      .fusion-tb-header .mobile-search { display: none !important; }
      .fusion-tb-header .header-container { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
      .fusion-tb-header .header-inner { width: calc(100% - 80px) !important; max-width: 1400px !important; margin: 0 auto !important; padding-left: 0 !important; padding-right: 0 !important; position: relative; }
      .fusion-tb-header .logo-container { position: static; transform: none; }
    }
    @media (min-width: 1536px) {
      .fusion-tb-header .header-inner { max-width: 90% !important; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: headerStyles }} suppressHydrationWarning />
      <div className="fusion-tb-header" style={{ width: '100vw' }} suppressHydrationWarning>
        <header className="fusion-fullwidth fullwidth-box fusion-builder-row-1 fusion-flex-container has-pattern-background has-mask-background my-sticky-header hundred-percent-fullwidth non-hundred-percent-height-scrolling"
                style={{
                  width: '100vw',
                  backgroundColor: 'white',
                  padding: '12px 0',
                  marginLeft: 'calc(50% - 50vw)',
                  marginRight: 'calc(50% - 50vw)',
                  position: 'relative',
                  zIndex: 1000
                }}>
        <div className="fusion-builder-row fusion-row fusion-flex-align-items-center fusion-flex-justify-content-space-between fusion-flex-content-wrap header-container">
          <div className="header-inner" style={{ position: 'relative', width: '100%' }}>
          
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

          {/* Mobile Logo - Center on mobile */}
          <div className="mobile-center mobile-nav" style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
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

          {/* Left Section: Logo + Navigation Links */}
          <div className="desktop-nav" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Logo */}
            <div className="logo-container" style={{ flex: '0 0 auto', marginRight: '8px' }}>
              <Link href={isUSRoute ? "/us" : "/"} aria-label="logo" style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src="/product-images/us/logo-1.png"
                  alt="Nicotine Pouches Logo"
                  width={220}
                  height={50}
                  className="img-responsive"
                  priority
                  style={{ height: 'auto', width: 'auto', maxHeight: '45px' }}
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <div>
                {isUSRoute ? <USMegaMenu /> : <MegaMenu />}
              </div>

              <Link href={getLocalizedPath('/guides')} style={{
                color: '#1f2544',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                fontWeight: '600',
                padding: '8px 12px',
                transition: 'all 0.2s ease'
              }}>
                Guides
              </Link>

              <Link href={getLocalizedPath('/how-to-use')} style={{
                color: '#1f2544',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                fontWeight: '600',
                padding: '8px 12px',
                transition: 'all 0.2s ease'
              }}>
                How to use
              </Link>

              <Link href={getLocalizedPath('/compare')} style={{
                color: '#1f2544',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                fontWeight: '600',
                padding: '8px 12px',
                transition: 'all 0.2s ease'
              }}>
                Compare
              </Link>

              <Link href={getLocalizedPath('/about-us')} style={{
                color: '#1f2544',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                fontWeight: '600',
                padding: '8px 12px',
                transition: 'all 0.2s ease'
              }}>
                About us
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="desktop-nav search-container" style={{ flex: '1', display: 'flex', justifyContent: 'center', maxWidth: '400px', margin: '0 20px' }}>
            <button
              onClick={toggleSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e7eb',
                borderRadius: '25px',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span>Search products...</span>
            </button>
          </div>

          {/* Right Section: Country Switcher + Sign In Button */}
          <div className="desktop-nav" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Country Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                  color: '#1f2544',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '16px' }}>{isUSRoute ? '🇺🇸' : '🇬🇧'}</span>
                <span>{isUSRoute ? 'US' : 'UK'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {isCountryDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '4px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  zIndex: 1000,
                  minWidth: '140px'
                }}>
                  <Link
                    href="/"
                    onClick={() => setIsCountryDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                      color: !isUSRoute ? '#1f2544' : '#6b7280',
                      backgroundColor: !isUSRoute ? '#f3f4f6' : '#fff',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🇬🇧</span>
                    <span>United Kingdom</span>
                  </Link>
                  <Link
                    href="/us"
                    onClick={() => setIsCountryDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                      color: isUSRoute ? '#1f2544' : '#6b7280',
                      backgroundColor: isUSRoute ? '#f3f4f6' : '#fff',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🇺🇸</span>
                    <span>United States</span>
                  </Link>
                </div>
              )}
            </div>

            {user ? (
              // User is logged in
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '100px',
                    fontSize: '14px',
                    color: '#1f2544',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                    fontWeight: '500'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#1f2544',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '11px'
                  }}>
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span>Account</span>
                </Link>
                <button
                  onClick={signOut}
                  style={{
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    color: '#1f2544',
                    padding: '10px 20px',
                    borderRadius: '100px',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
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
                  border: '1px solid #e5e7eb',
                  color: '#1f2544',
                  padding: '10px 20px',
                  borderRadius: '100px',
                  fontSize: '14px',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign in
              </button>
            )}
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
                <Link
                  href={getLocalizedPath('/guides')}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  Guides
                </Link>

                <Link
                  href={getLocalizedPath('/how-to-use')}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  How to use
                </Link>

                <Link
                  href={getLocalizedPath('/compare')}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '18px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                        backgroundColor: '#1f2544',
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
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      width: '100%'
                    }}
                  >
                    Sign in
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

      {/* Price Alert Modal - Site-wide */}
      <ClientPriceAlertModal />
      </div>
    </>
  );
};

export default Header;
