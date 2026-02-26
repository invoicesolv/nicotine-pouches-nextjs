import { NextRequest, NextResponse } from 'next/server';

// API Key for crawler authentication
const CRAWLER_API_KEY = (process.env.CRAWLER_API_KEY || '').trim();

export async function GET(request: NextRequest) {
  // This endpoint helps debug API key configuration
  // It shows if the key is loaded (first 10 chars only for security)
  
  const authHeader = request.headers.get('authorization');
  const apiKeyParam = request.nextUrl.searchParams.get('apiKey');
  
  const receivedToken = authHeader 
    ? authHeader.replace(/^Bearer\s+/i, '').trim()
    : (apiKeyParam ? apiKeyParam.trim() : null);
  
  const isAuthenticated = receivedToken === CRAWLER_API_KEY;
  
  return NextResponse.json({
    apiKeyConfigured: !!CRAWLER_API_KEY,
    apiKeyLength: CRAWLER_API_KEY?.length || 0,
    apiKeyFirst10: CRAWLER_API_KEY?.substring(0, 10) || 'NOT SET',
    hasAuthHeader: !!authHeader,
    hasApiKeyParam: !!apiKeyParam,
    receivedTokenLength: receivedToken?.length || 0,
    receivedTokenFirst10: receivedToken?.substring(0, 10) || 'N/A',
    tokensMatch: isAuthenticated,
    authenticated: isAuthenticated,
    environment: process.env.NODE_ENV,
    // Show if keys match character by character (for debugging)
    comparison: {
      sameLength: receivedToken?.length === CRAWLER_API_KEY?.length,
      firstCharMatch: receivedToken?.[0] === CRAWLER_API_KEY?.[0],
      lastCharMatch: receivedToken?.[receivedToken.length - 1] === CRAWLER_API_KEY?.[CRAWLER_API_KEY.length - 1]
    }
  });
}


