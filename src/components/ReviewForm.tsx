'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import ReviewBalls from './ReviewBalls';
import LoginModal from './LoginModal';

interface ReviewFormProps {
  productId: number;
  productName: string;
  vendors: Array<{
    id: number;
    name: string;
    logo: string;
  }>;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, productName, vendors, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!selectedVendor || rating === 0 || !reviewText.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    if (reviewText.length > 160) {
      setMessage('Review must be 160 characters or less');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          vendorId: selectedVendor,
          rating,
          reviewText: reviewText.trim(),
          userId: user?.id || 'anonymous'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Review submitted successfully!');
        setSelectedVendor(null);
        setRating(0);
        setReviewText('');
        onReviewSubmitted?.();
      } else {
        setMessage(data.error || 'Failed to submit review');
      }
    } catch (error) {
      setMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
  };

  const selectedVendorData = vendors.find(v => v.id === selectedVendor);

  return (
    <>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Leave a Review
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Vendor Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Choose Vendor *
            </label>
            <select
              value={selectedVendor || ''}
              onChange={(e) => setSelectedVendor(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
              required
            >
              <option value="">Select a vendor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Rating *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  style={{
                    cursor: 'pointer',
                    opacity: star <= rating ? 1 : 0.3,
                    transition: 'opacity 0.2s ease',
                    width: '16px',
                    height: '16px'
                  }}
                >
                  <Image
                    src="/cropped-NP-1-2.svg"
                    alt="NP Ball"
                    width={16}
                    height={16}
                    style={{
                      opacity: star <= rating ? 1 : 0.3,
                      filter: star <= rating ? 'none' : 'grayscale(100%) brightness(0.3)',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                </div>
              ))}
              <span style={{
                marginLeft: '8px',
                fontSize: '0.875rem',
                color: '#6b7280',
                whiteSpace: 'nowrap'
              }}>
                {rating > 0 ? `${rating} out of 5` : 'Click to rate'}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Your Review *
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product from this vendor..."
              maxLength={160}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: '"Klarna Text", system-ui, -apple-system, sans-serif',
                resize: 'vertical',
                minHeight: '80px'
              }}
              required
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.25rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                {reviewText.length}/160 characters
              </span>
              {reviewText.length > 160 && (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#dc2626'
                }}>
                  Too long!
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedVendor || rating === 0 || !reviewText.trim() || reviewText.length > 160}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: isSubmitting ? '#9ca3af' : '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>

          {/* Message */}
          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: message.includes('successfully') ? '#d1fae5' : '#fee2e2',
              color: message.includes('successfully') ? '#065f46' : '#dc2626',
              border: `1px solid ${message.includes('successfully') ? '#a7f3d0' : '#fecaca'}`
            }}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          // Optionally show a message that they can now leave a review
        }}
      />
    </>
  );
}
