import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { pushReviewsBatchToAxelio } from '@/lib/axelio';

// API Key for crawler authentication
const CRAWLER_API_KEY = (process.env.CRAWLER_API_KEY || '').trim();

interface TrustpilotReview {
  reviewUrl: string;
  customerName: string;
  rating: number;
  headline?: string;
  reviewText: string;
  reviewDate: string; // Can be "November 19, 2025" format
  hasReply?: boolean;
  replyTitle?: string;
  replyDate?: string;
  replyText?: string;
}

interface ReviewsPayload {
  vendorId: number;
  reviews: TrustpilotReview[];
}

// Helper function to parse review date
function parseReviewDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Try parsing common date formats
    // Format: "November 19, 2025" or "Nov 5, 2025"
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try other formats if needed
    return null;
  } catch (error) {
    console.error('Error parsing review date:', dateStr, error);
    return null;
  }
}

// Authenticate the request (same as enrich-prices)
function authenticateRequest(request: NextRequest): boolean {
  if (!CRAWLER_API_KEY || CRAWLER_API_KEY.length === 0) {
    console.error('CRAWLER_API_KEY is not set in environment variables');
    return false;
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === CRAWLER_API_KEY) {
      return true;
    }
  }

  // Check query parameter
  const apiKey = request.nextUrl.searchParams.get('apiKey');
  if (apiKey) {
    const trimmedKey = apiKey.trim();
    if (trimmedKey === CRAWLER_API_KEY) {
      return true;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API key.' },
        { status: 401 }
      );
    }

    const body: ReviewsPayload = await request.json();
    const { vendorId, reviews } = body;

    // Validate input
    if (!vendorId || !reviews || !Array.isArray(reviews)) {
      return NextResponse.json(
        { error: 'Invalid request. vendorId and reviews array are required.' },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await supabaseAdmin()
      .from('vendors')
      .select('id, name')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: `Vendor with ID ${vendorId} not found.` },
        { status: 404 }
      );
    }

    console.log(`📝 Processing ${reviews.length} reviews for vendor: ${vendor.name} (ID: ${vendorId})`);

    // Process reviews
    const results = {
      total: reviews.length,
      success: 0,
      failed: 0,
      updated: 0,
      created: 0,
      errors: [] as Array<{ review: string; error: string }>
    };

    for (const review of reviews) {
      try {
        // Validate review data
        if (!review.reviewUrl || !review.customerName || !review.rating || !review.reviewText) {
          results.failed++;
          results.errors.push({
            review: review.reviewUrl || 'Unknown',
            error: 'Missing required fields: reviewUrl, customerName, rating, or reviewText'
          });
          continue;
        }

        // Validate rating
        if (review.rating < 1 || review.rating > 5) {
          results.failed++;
          results.errors.push({
            review: review.reviewUrl,
            error: `Invalid rating: ${review.rating}. Must be between 1 and 5.`
          });
          continue;
        }

        // Parse dates
        const reviewDate = parseReviewDate(review.reviewDate);
        const replyDate = review.replyDate ? parseReviewDate(review.replyDate) : null;

        // Check if review already exists
        const { data: existingReview, error: checkError } = await supabaseAdmin()
          .from('trustpilot_reviews')
          .select('id')
          .eq('review_url', review.reviewUrl)
          .single();

        const reviewData = {
          vendor_id: vendorId,
          review_url: review.reviewUrl,
          customer_name: review.customerName,
          rating: review.rating,
          headline: review.headline || null,
          review_text: review.reviewText,
          review_date: reviewDate,
          has_reply: review.hasReply || false,
          reply_title: review.replyTitle || null,
          reply_date: replyDate,
          reply_text: review.replyText || null,
          updated_at: new Date().toISOString()
        };

        if (existingReview && !checkError) {
          // Update existing review
          const { error: updateError } = await supabaseAdmin()
            .from('trustpilot_reviews')
            .update(reviewData)
            .eq('id', existingReview.id);

          if (updateError) {
            results.failed++;
            results.errors.push({
              review: review.reviewUrl,
              error: updateError.message
            });
          } else {
            results.success++;
            results.updated++;
          }
        } else {
          // Create new review
          const { error: insertError } = await supabaseAdmin()
            .from('trustpilot_reviews')
            .insert(reviewData);

          if (insertError) {
            // Check if it's a duplicate key error
            if (insertError.code === '23505') {
              // Try to update instead
              const { error: updateError } = await supabaseAdmin()
                .from('trustpilot_reviews')
                .update(reviewData)
                .eq('review_url', review.reviewUrl);

              if (updateError) {
                results.failed++;
                results.errors.push({
                  review: review.reviewUrl,
                  error: updateError.message
                });
              } else {
                results.success++;
                results.updated++;
              }
            } else {
              results.failed++;
              results.errors.push({
                review: review.reviewUrl,
                error: insertError.message
              });
            }
          } else {
            results.success++;
            results.created++;
          }
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          review: review.reviewUrl || 'Unknown',
          error: error.message || 'Unknown error'
        });
      }
    }

    console.log(`Reviews processing complete: ${results.success} success, ${results.failed} failed`);

    // Sync successfully processed reviews to Axelio CRM (fire-and-forget)
    if (results.success > 0) {
      const axelioReviews = reviews
        .filter(r => r.reviewUrl && r.customerName && r.rating && r.reviewText)
        .map(r => ({
          source: 'trustpilot' as const,
          source_id: r.reviewUrl,
          product_name: vendor.name,
          reviewer_name: r.customerName,
          rating: r.rating,
          title: r.headline || '',
          body: r.reviewText,
          reviewed_at: r.reviewDate ? new Date(r.reviewDate).toISOString() : undefined,
        }));

      if (axelioReviews.length > 0) {
        pushReviewsBatchToAxelio(axelioReviews).catch((err) => {
          console.error('Failed to push reviews to Axelio:', err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      vendorId: vendorId,
      vendorName: vendor.name,
      summary: {
        total: results.total,
        success: results.success,
        failed: results.failed,
        updated: results.updated,
        created: results.created
      },
      errors: results.errors.length > 0 ? results.errors : undefined
    });
  } catch (error: any) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for authentication check
export async function GET(request: NextRequest) {
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid API key.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Reviews API is accessible. Use POST to submit Trustpilot reviews.',
    endpoint: '/api/crawler/reviews',
    format: {
      vendorId: 'number (required)',
      reviews: [
        {
          reviewUrl: 'string (required, unique)',
          customerName: 'string (required)',
          rating: 'number (required, 1-5)',
          headline: 'string (optional)',
          reviewText: 'string (required)',
          reviewDate: 'string (optional, e.g., "November 19, 2025")',
          hasReply: 'boolean (optional)',
          replyTitle: 'string (optional)',
          replyDate: 'string (optional)',
          replyText: 'string (optional)'
        }
      ]
    }
  });
}

