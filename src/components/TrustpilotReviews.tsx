'use client';

import { useState, useMemo } from 'react';
import { Star, ExternalLink, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface TrustpilotReview {
  id: string;
  vendor_id: number;
  vendor_name?: string;
  vendor_logo?: string | null;
  review_url: string;
  customer_name: string;
  rating: number;
  headline: string | null;
  review_text: string;
  review_date: string | null;
  has_reply: boolean;
  reply_title: string | null;
  reply_date: string | null;
  reply_text: string | null;
}

interface TrustpilotReviewsProps {
  reviews: TrustpilotReview[];
  initialLimit?: number;
}

export default function TrustpilotReviews({ reviews, initialLimit = 5 }: TrustpilotReviewsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Get unique vendors from reviews
  const vendors = useMemo(() => {
    const vendorMap = new Map<string, { name: string; logo: string | null; count: number }>();
    reviews.forEach(review => {
      if (review.vendor_name) {
        const existing = vendorMap.get(review.vendor_name);
        if (existing) {
          existing.count++;
        } else {
          vendorMap.set(review.vendor_name, {
            name: review.vendor_name,
            logo: review.vendor_logo || null,
            count: 1
          });
        }
      }
    });
    return Array.from(vendorMap.values()).sort((a, b) => b.count - a.count);
  }, [reviews]);

  // Filter reviews by vendor and rating
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (selectedVendor) {
      filtered = filtered.filter(r => r.vendor_name === selectedVendor);
    }

    if (ratingFilter !== null) {
      filtered = filtered.filter(r => r.rating === ratingFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = a.review_date ? new Date(a.review_date).getTime() : 0;
      const dateB = b.review_date ? new Date(b.review_date).getTime() : 0;
      return dateB - dateA;
    });
  }, [reviews, selectedVendor, ratingFilter]);

  const displayedReviews = isExpanded ? filteredReviews : filteredReviews.slice(0, initialLimit);
  const hasMore = filteredReviews.length > initialLimit;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating: number) => (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          fill={star <= rating ? '#00b67a' : '#e5e7eb'}
          color={star <= rating ? '#00b67a' : '#e5e7eb'}
          style={{ strokeWidth: 0 }}
        />
      ))}
    </div>
  );

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            backgroundColor: '#00b67a',
            borderRadius: '6px'
          }}>
            <Star size={14} fill="#fff" color="#fff" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>
              Trustpilot
            </span>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151'
          }}>
            {filteredReviews.length} reviews
          </span>
        </div>
      </div>

      {/* Filters */}
      {vendors.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          {/* Vendor Filter */}
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '10px'
          }}>
            <button
              onClick={() => setSelectedVendor(null)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '500',
                border: selectedVendor === null ? '1.5px solid #1f2544' : '1px solid #e5e7eb',
                backgroundColor: selectedVendor === null ? '#1f2544' : '#fff',
                color: selectedVendor === null ? '#fff' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {vendors.map((vendor) => (
              <button
                key={vendor.name}
                onClick={() => setSelectedVendor(vendor.name)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '500',
                  border: selectedVendor === vendor.name ? '1.5px solid #1f2544' : '1px solid #e5e7eb',
                  backgroundColor: selectedVendor === vendor.name ? '#1f2544' : '#fff',
                  color: selectedVendor === vendor.name ? '#fff' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {vendor.logo && (
                  <img
                    src={vendor.logo}
                    alt=""
                    style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                {vendor.name} ({vendor.count})
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  border: ratingFilter === rating ? '1.5px solid #00b67a' : '1px solid #e5e7eb',
                  backgroundColor: ratingFilter === rating ? '#ecfdf5' : '#fff',
                  color: ratingFilter === rating ? '#00b67a' : '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Star size={10} fill={ratingFilter === rating ? '#00b67a' : '#d1d5db'} color={ratingFilter === rating ? '#00b67a' : '#d1d5db'} />
                {rating}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {displayedReviews.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
          No reviews match the selected filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                border: '1px solid #f3f4f6'
              }}
            >
              {/* Review Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderStars(review.rating)}
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2544' }}>
                    {review.customer_name}
                  </span>
                  {review.vendor_name && (
                    <span style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      backgroundColor: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      {review.vendor_logo && (
                        <img src={review.vendor_logo} alt="" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
                      )}
                      {review.vendor_name}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                  {formatDate(review.review_date)}
                </span>
              </div>

              {/* Headline */}
              {review.headline && (
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1f2544',
                  margin: '0 0 6px 0'
                }}>
                  {review.headline}
                </h4>
              )}

              {/* Review Text */}
              <p style={{
                fontSize: '12px',
                color: '#4b5563',
                lineHeight: '1.5',
                margin: '0 0 8px 0'
              }}>
                {review.review_text}
              </p>

              {/* View Link */}
              <a
                href={review.review_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '11px',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                View <ExternalLink size={10} />
              </a>

              {/* Reply */}
              {review.has_reply && review.reply_text && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '6px',
                  borderLeft: '3px solid #3b82f6'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px'
                  }}>
                    <MessageSquare size={12} color="#3b82f6" />
                    {review.vendor_logo && (
                      <img src={review.vendor_logo} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                    )}
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af' }}>
                      Reply from {review.vendor_name}
                    </span>
                    {review.reply_date && (
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>
                        {formatDate(review.reply_date)}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#1e3a8a',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {review.reply_text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show More Button */}
      {hasMore && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#1f2544',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Show All ({filteredReviews.length})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
