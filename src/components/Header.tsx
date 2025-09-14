'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MegaMenu from './MegaMenu';
import LiveSearch from './LiveSearch';
import LoginModal from './LoginModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { getLocalizedPath } = useLanguage();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

  return (
    <div className="fusion-tb-header" style={{ width: '100vw' }}>
      <header className="fusion-fullwidth fullwidth-box fusion-builder-row-1 fusion-flex-container has-pattern-background has-mask-background my-sticky-header hundred-percent-fullwidth non-hundred-percent-height-scrolling fusion-no-small-visibility fusion-no-medium-visibility" 
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
        <div className="fusion-builder-row fusion-row fusion-flex-align-items-center fusion-flex-justify-content-space-between fusion-flex-content-wrap" 
             style={{
               width: '100%',
               maxWidth: 'none',
               margin: '0',
               padding: '0 20px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between'
             }}>
          
          {/* Logo */}
          <div style={{ flex: '0 0 auto' }}>
            <Link href="/" aria-label="logo">
              <Image
                src="https://gianna.templweb.com/wp-content/uploads/2024/08/logo-1.png"
                alt="Nicotine Pouches Logo"
                width={200}
                height={54}
                className="img-responsive"
                priority
                style={{ height: 'auto', maxHeight: '50px' }}
              />
            </Link>
          </div>

          {/* Live Search Bar */}
          <div style={{ flex: '1 1 auto', maxWidth: '400px', margin: '0 30px' }}>
            <LiveSearch />
          </div>

          {/* Navigation */}
          <div style={{ flex: '0 0 auto', margin: '0 20px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ marginRight: '15px' }}>
                <MegaMenu />
              </div>
              
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
              
              <Link href="/vendors" style={{
                color: '#333',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                padding: '10px 15px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                Vendors
              </Link>
              
              <Link href="/compare" style={{
                color: '#FD8E98',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                padding: '10px 15px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: '#FFF5F6',
                border: '1px solid #FD8E98'
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

            {/* User Actions */}
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
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
      </header>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Header;
