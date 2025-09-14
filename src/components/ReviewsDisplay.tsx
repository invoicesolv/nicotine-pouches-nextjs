'use client';

import { useState, useEffect } from 'react';
import ReviewBalls from './ReviewBalls';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  vendors: {
    id: number;
    name: string;
    logo_url: string;
  };
}

interface ReviewsDisplayProps {
  productId: number;
  vendorId?: number;
}

export default function ReviewsDisplay({ productId, vendorId }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId, vendorId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ productId: productId.toString() });
      if (vendorId) {
        params.append('vendorId', vendorId.toString());
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#6b7280'
        }}>
          Loading reviews...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <div style={{
          color: '#dc2626',
          textAlign: 'center',
          padding: '1rem'
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
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
          Reviews
        </h3>
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          padding: '2rem 1rem'
        }}>
          No reviews yet. Be the first to review this product!
        </div>
      </div>
    );
  }

  return (
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
        Reviews ({reviews.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{
              padding: '1rem',
              border: '1px solid #f3f4f6',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            {/* Review Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {review.vendors.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ReviewBalls rating={review.rating} size={16} />
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {review.rating}.0
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                {formatDate(review.created_at)}
              </div>
            </div>

            {/* Review Text */}
            <div style={{
              fontSize: '0.875rem',
              color: '#374151',
              lineHeight: '1.5'
            }}>
              {review.review_text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
