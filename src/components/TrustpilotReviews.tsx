'use client';

import { useState, useMemo, useCallback } from 'react';
import { Star, ExternalLink, MessageSquare, ChevronDown, Loader2, Info } from 'lucide-react';

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
  vendorIds?: number[];
  totalCount?: number;
}

// Star rating colors based on Trustpilot's design
const getStarColor = (rating: number): string => {
  if (rating >= 5) return '#00B67A';
  if (rating >= 4) return '#73CF11';
  if (rating >= 3) return '#FFCE00';
  if (rating >= 2) return '#FF8622';
  return '#FF3722';
};

export default function TrustpilotReviews({
  reviews: initialReviews,
  initialLimit = 10,
  vendorIds,
  totalCount
}: TrustpilotReviewsProps) {
  const [allReviews, setAllReviews] = useState<TrustpilotReview[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(vendorIds && vendorIds.length > 0);
  const [checkedForMore, setCheckedForMore] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const loadMoreReviews = useCallback(async () => {
    if (!vendorIds || vendorIds.length === 0 || isLoading) return;

    setIsLoading(true);
    setCheckedForMore(true);
    try {
      const offset = allReviews.length;
      const response = await fetch(
        `/api/trustpilot-reviews?vendorIds=${vendorIds.join(',')}&limit=10&offset=${offset}`
      );
      const data = await response.json();

      if (data.reviews && data.reviews.length > 0) {
        const existingIds = new Set(allReviews.map(r => r.id));
        const newReviews = data.reviews.filter((r: TrustpilotReview) => !existingIds.has(r.id));
        if (newReviews.length > 0) {
          setAllReviews(prev => [...prev, ...newReviews]);
        }
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [vendorIds, allReviews, isLoading]);

  if (!initialReviews || initialReviews.length === 0) {
    return null;
  }

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / allReviews.length;
  }, [allReviews]);

  const vendors = useMemo(() => {
    const vendorMap = new Map<string, { name: string; logo: string | null; count: number }>();
    allReviews.forEach(review => {
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
  }, [allReviews]);

  const filteredReviews = useMemo(() => {
    let filtered = [...allReviews];

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
  }, [allReviews, selectedVendor, ratingFilter]);

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

  const renderStars = (rating: number, size: number = 16) => {
    const color = getStarColor(rating);
    return (
      <div
        style={{ display: 'flex', gap: '2px' }}
        role="img"
        aria-label={`${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rating ? color : '#dcdce6'}
            color={star <= rating ? color : '#dcdce6'}
            strokeWidth={0}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  const toggleReply = (reviewId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  return (
    <section
      aria-label="Customer Reviews"
      style={{
        marginTop: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={20} fill="#00b67a" color="#00b67a" strokeWidth={0} aria-hidden="true" />
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
            Trustpilot
          </span>
          {averageRating > 0 && (
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#00b67a' }}>
              {averageRating.toFixed(1)}
            </span>
          )}
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            ({totalCount || allReviews.length}+ reviews)
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
        {/* Vendor Filter */}
        {vendors.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <button
              onClick={() => setSelectedVendor(null)}
              aria-pressed={selectedVendor === null}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                backgroundColor: selectedVendor === null ? '#1f2937' : '#f3f4f6',
                color: selectedVendor === null ? '#fff' : '#4b5563',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All
            </button>
            {vendors.map((vendor) => (
              <button
                key={vendor.name}
                onClick={() => setSelectedVendor(vendor.name)}
                aria-pressed={selectedVendor === vendor.name}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: 'none',
                  backgroundColor: selectedVendor === vendor.name ? '#1f2937' : '#f3f4f6',
                  color: selectedVendor === vendor.name ? '#fff' : '#4b5563',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                {vendor.logo && (
                  <img
                    src={vendor.logo}
                    alt=""
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                )}
                <span>{vendor.name}</span>
                <span style={{
                  backgroundColor: selectedVendor === vendor.name ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px'
                }}>
                  {vendor.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Rating Filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const isSelected = ratingFilter === rating;
            const starColor = getStarColor(rating);
            return (
              <button
                key={rating}
                onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                aria-pressed={isSelected}
                aria-label={`Filter by ${rating} star reviews`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: isSelected ? `2px solid ${starColor}` : '1px solid #e5e7eb',
                  backgroundColor: isSelected ? `${starColor}10` : '#fff',
                  color: isSelected ? starColor : '#6b7280',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Star
                  size={14}
                  fill={isSelected ? starColor : '#d1d5db'}
                  color={isSelected ? starColor : '#d1d5db'}
                  strokeWidth={0}
                  aria-hidden="true"
                />
                <span>{rating}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ padding: '16px 24px' }}>
        {filteredReviews.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '12px'
          }}>
            <Star size={32} color="#d1d5db" style={{ marginBottom: '12px' }} aria-hidden="true" />
            <p style={{ fontSize: '14px', margin: 0 }}>No reviews match your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredReviews.map((review) => (
              <article
                key={review.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  transition: 'box-shadow 0.15s ease'
                }}
              >
                {/* Review Header */}
                <header style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {renderStars(review.rating)}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      {review.customer_name}
                    </span>
                    {review.vendor_name && (
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        backgroundColor: '#fff',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {review.vendor_logo && (
                          <img
                            src={review.vendor_logo}
                            alt=""
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        {review.vendor_name}
                      </span>
                    )}
                  </div>
                  <time
                    dateTime={review.review_date || undefined}
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatDate(review.review_date)}
                  </time>
                </header>

                {/* Headline */}
                {review.headline && (
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {review.headline}
                  </h3>
                )}

                {/* Review Text */}
                <p style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0 0 12px 0'
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
                    gap: '4px',
                    fontSize: '13px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '4px 0',
                    borderRadius: '4px'
                  }}
                >
                  View <ExternalLink size={12} aria-hidden="true" />
                </a>

                {/* Reply */}
                {review.has_reply && review.reply_text && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px'
                    }}>
                      <MessageSquare size={14} color="#6b7280" aria-hidden="true" />
                      {review.vendor_logo && (
                        <img
                          src={review.vendor_logo}
                          alt=""
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid #fff',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        />
                      )}
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Reply from {review.vendor_name}
                      </span>
                      {review.reply_date && (
                        <time
                          dateTime={review.reply_date}
                          style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginLeft: 'auto'
                          }}
                        >
                          {formatDate(review.reply_date)}
                        </time>
                      )}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {review.reply_text}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div style={{
          padding: '16px 24px 24px',
          textAlign: 'center'
        }}>
          <button
            onClick={loadMoreReviews}
            disabled={isLoading}
            aria-busy={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 28px',
              backgroundColor: isLoading ? '#9ca3af' : '#00b67a',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isLoading ? 'none' : '0 2px 8px rgba(0, 182, 122, 0.3)',
              minWidth: '180px'
            }}
          >
            {isLoading ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: 'trustpilot-spin 1s linear infinite' }}
                  aria-hidden="true"
                />
                Loading…
              </>
            ) : (
              <>
                <ChevronDown size={16} aria-hidden="true" />
                {checkedForMore ? 'Load More Reviews' : 'Show More Reviews'}
              </>
            )}
          </button>
          <style>{`
            @keyframes trustpilot-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes trustpilot-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(0deg); }
              }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}
