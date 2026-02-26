'use client';

import { useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';

interface StockNotificationButtonProps {
  productName: string;
  vendorName: string;
  productId?: number;
}

export default function StockNotificationButton({ productName, vendorName, productId }: StockNotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/stock-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          productName,
          vendorName,
          productSlug: productName.toLowerCase().replace(/\s+/g, '-')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setMessage({ type: 'success', text: 'You\'re already subscribed! We\'ll notify you when this product is back in stock.' });
        } else {
          setMessage({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
        }
        return;
      }

      setMessage({ type: 'success', text: 'Successfully subscribed! We\'ll notify you when this product is back in stock.' });
      setEmail('');
      
      // Close form after 2 seconds on success
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <Bell size={12} />
        <span>Notify me</span>
      </button>
    );
  }

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      minWidth: '200px'
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 100
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
          Get notified when back in stock
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isSubmitting}
          style={{
            padding: '6px 8px',
            fontSize: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        {message && (
          <div style={{
            fontSize: '0.65rem',
            color: message.type === 'success' ? '#059669' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {message.type === 'success' && <CheckCircle size={12} />}
            {message.text}
          </div>
        )}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setMessage(null);
              setEmail('');
            }}
            style={{
              padding: '6px 8px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

