'use client';
import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleDenyAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '20px',
      zIndex: 9999,
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {!showDetails ? (
          // Simple view
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0
            }}>
              <img 
                src="/cropped-NP-1-2.svg" 
                alt="NP Logo" 
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
              <span style={{
                fontWeight: '600',
                fontSize: '16px',
                color: '#1f2937'
              }}>
                Nicotine Pouches
              </span>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              minWidth: '300px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                This website uses cookies
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 8px 0',
                lineHeight: '1.5'
              }}>
                We use cookies to personalise content and ads, to provide social media features and to analyse our traffic. 
                We also share information about your use of our site with our social media, advertising and analytics partners.
              </p>
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '0'
                }}
              >
                Show details &gt;
              </button>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexShrink: 0
            }}>
              <button
                onClick={handleDenyAll}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Deny
              </button>
              <button
                onClick={handleCustomize}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Customize &gt;
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Allow all
              </button>
            </div>
          </div>
        ) : (
          // Detailed view
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <img 
                  src="/cropped-NP-1-2.svg" 
                  alt="NP Logo" 
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain'
                  }}
                />
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0'
                }}>
                  Cookie Preferences
                </h2>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Cookie Categories */}
            <div style={{
              marginBottom: '30px'
            }}>
              {[
                {
                  key: 'necessary' as keyof CookiePreferences,
                  title: 'Necessary Cookies',
                  description: 'These cookies are essential for the website to function properly. They cannot be disabled.',
                  required: true
                },
                {
                  key: 'analytics' as keyof CookiePreferences,
                  title: 'Analytics Cookies',
                  description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
                  required: false
                },
                {
                  key: 'marketing' as keyof CookiePreferences,
                  title: 'Marketing Cookies',
                  description: 'These cookies are used to track visitors across websites to display relevant and engaging advertisements.',
                  required: false
                },
                {
                  key: 'functional' as keyof CookiePreferences,
                  title: 'Functional Cookies',
                  description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences.',
                  required: false
                }
              ].map((category) => (
                <div key={category.key} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  backgroundColor: preferences[category.key] ? '#f0f9ff' : '#f9fafb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {category.title}
                        {category.required && (
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            fontWeight: '400',
                            marginLeft: '8px'
                          }}>
                            (Required)
                          </span>
                        )}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0',
                        lineHeight: '1.5'
                      }}>
                        {category.description}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {preferences[category.key] ? 'On' : 'Off'}
                      </span>
                      <button
                        onClick={() => togglePreference(category.key)}
                        disabled={category.required}
                        style={{
                          width: '44px',
                          height: '24px',
                          backgroundColor: preferences[category.key] ? '#3b82f6' : '#d1d5db',
                          border: 'none',
                          borderRadius: '12px',
                          position: 'relative',
                          cursor: category.required ? 'not-allowed' : 'pointer',
                          opacity: category.required ? 0.6 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '2px',
                          left: preferences[category.key] ? '22px' : '2px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={handleDenyAll}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Deny All
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
