'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SignupFormProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export default function SignupForm({ 
  source = 'newsletter',
  placeholder = 'Your email*',
  buttonText = 'Submit',
  className = '',
  onSuccess,
  onError
}: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      onError?.('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully subscribed!');
        setEmail('');
        onSuccess?.(email);
        
        // Redirect to thank you page after a short delay
        setTimeout(() => {
          // Redirect to US thank you page if source indicates US region
          const isUSSource = source.includes('us-') || source === 'us-newsletter';
          router.push(isUSSource ? '/us/thank-you' : '/thank-you');
        }, 1500);
      } else {
        setMessage(data.error || 'Something went wrong');
        onError?.(data.error || 'Something went wrong');
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '420px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '50px',
        padding: '4px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="newsletter-input"
          style={{
            flex: 1,
            padding: '10px 20px',
            border: 'none',
            borderRadius: '50px',
            fontSize: '15px',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: '400',
            outline: 'none',
            backgroundColor: 'transparent',
            color: '#333'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: loading ? '#999' : '#1a1a1a',
            color: 'white',
            border: '2px solid #1a1a1a',
            borderRadius: '50%',
            fontSize: '16px',
            fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
            fontWeight: '400',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#333';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
            }
          }}
        >
          {loading ? '...' : '→'}
        </button>
      </form>
      
      {message && (
        <div style={{
          marginTop: '12px',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
          fontWeight: '500',
          textAlign: 'center',
          backgroundColor: message.includes('Success') ? '#d1fae5' : '#fee2e2',
          color: message.includes('Success') ? '#065f46' : '#dc2626',
          border: `1px solid ${message.includes('Success') ? '#a7f3d0' : '#fecaca'}`
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
