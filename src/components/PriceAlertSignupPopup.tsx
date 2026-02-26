'use client';

import { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';

interface PriceAlertSignupPopupProps {
  delay?: number; // Delay in milliseconds before showing popup
  scrollThreshold?: number; // Show after scrolling X% of the page
}

export default function PriceAlertSignupPopup({ 
  delay = 3000, // Show after 3 seconds
  scrollThreshold = 30 // Show after scrolling 30% of the page
}: PriceAlertSignupPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasShown, setHasShown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted in browser
  useEffect(() => {
    setIsMounted(true);
    console.log('[PriceAlertPopup] Component mounted');
  }, []);

  // Listen for custom event to show popup on button click
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const handleShowPriceAlert = () => {
      console.log('[PriceAlertPopup] Custom event triggered - showing popup');
      setIsOpen(true);
    };

    window.addEventListener('showPriceAlert', handleShowPriceAlert);

    return () => {
      window.removeEventListener('showPriceAlert', handleShowPriceAlert);
    };
  }, [isMounted]);

  useEffect(() => {
    // Only run after component is mounted in browser
    if (!isMounted || typeof window === 'undefined') return;

    // Check if user has already seen this popup (using localStorage)
    const hasSeenPopup = localStorage.getItem('priceAlertPopupShown');
    if (hasSeenPopup) {
      console.log('[PriceAlertPopup] User has already seen popup, skipping');
      return;
    }

    console.log('[PriceAlertPopup] Setting up popup triggers...', { delay, scrollThreshold });

    let timeoutId: NodeJS.Timeout;
    let scrollHandler: () => void;
    let hasTriggered = false;

    const triggerPopup = () => {
      if (!hasTriggered && !hasShown) {
        console.log('[PriceAlertPopup] Triggering popup');
        setIsOpen(true);
        setHasShown(true);
        hasTriggered = true;
        localStorage.setItem('priceAlertPopupShown', 'true');
      }
    };

    // Show after delay
    timeoutId = setTimeout(() => {
      triggerPopup();
    }, delay);

    // Show after scroll threshold
    scrollHandler = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= scrollThreshold) {
        triggerPopup();
        clearTimeout(timeoutId);
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [isMounted, delay, scrollThreshold, hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/price-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          productName: null, // General price alerts subscription
          productSlug: null,
          currentPrice: null,
          targetPrice: null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setMessage({ type: 'success', text: 'You\'re already subscribed! We\'ll notify you when prices update.' });
        } else {
          setMessage({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
        }
        return;
      }

      setMessage({ type: 'success', text: 'Successfully subscribed! We\'ll notify you when vendors update their prices.' });
      setEmail('');
      
      // Close popup after 2 seconds on success
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Always render the component structure, but control visibility
  // This ensures the component is mounted and useEffect runs

  // Debug: Log component state
  useEffect(() => {
    if (isMounted) {
      console.log('[PriceAlertPopup] Render state:', { isOpen, isMounted, hasShown });
    }
  }, [isOpen, isMounted, hasShown]);

  // Always render a hidden div when mounted so useEffect can run
  // This ensures the component is in the DOM and can set up triggers
  if (!isMounted) {
    return null;
  }

  // Render hidden div when not open so component stays mounted
  if (!isOpen) {
    return <div style={{ display: 'none' }} aria-hidden="true" />;
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes bellRing {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 30% {
            transform: rotate(-10deg);
          }
          20%, 40% {
            transform: rotate(10deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
        onClick={handleClose}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '0',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '180px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.1,
              zIndex: 0
            }}
          />

          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} color="#6b7280" />
          </button>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px 40px 40px' }}>
            {/* Icon */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  animation: 'bellRing 2s ease-in-out infinite'
                }}
              >
                <Bell size={40} color="#ffffff" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#0B051D',
                marginBottom: '12px',
                lineHeight: '1.2',
                textAlign: 'center',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                letterSpacing: '-0.02em'
              }}
            >
              Never Miss a Deal
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: '17px',
                color: '#6b7280',
                marginBottom: '32px',
                lineHeight: '1.6',
                textAlign: 'center',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}
            >
              Get notified instantly when vendors update their prices. Stay ahead with real-time price alerts.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {message && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                  }}
                >
                  {message.type === 'success' && <CheckCircle2 size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#fff',
                  background: isSubmitting 
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: isSubmitting ? 0.8 : 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  boxShadow: isSubmitting 
                    ? '0 4px 12px rgba(107, 114, 128, 0.3)'
                    : '0 8px 20px rgba(102, 126, 234, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>Subscribing</span>
                    <span>...</span>
                  </span>
                ) : (
                  'Subscribe for Price Alerts'
                )}
              </button>
            </form>

            <p
              style={{
                fontSize: '13px',
                color: '#9ca3af',
                marginTop: '20px',
                lineHeight: '1.5',
                textAlign: 'center',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}
            >
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

