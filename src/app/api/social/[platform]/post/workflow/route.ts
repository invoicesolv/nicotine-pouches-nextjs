import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getActiveWorkspaceId } from '@/lib/workspace-utils';

// Supported platforms
const SUPPORTED_PLATFORMS = ['facebook', 'twitter', 'instagram', 'linkedin', 'pinterest', 'whatsapp', 'email'];

/**
 * POST /api/social/{platform}/post/workflow
 * 
 * Posts content to a social media platform using stored account credentials
 * 
 * Required Headers:
 * - X-User-ID: User UUID
 * 
 * Required Body:
 * - content: string (post content)
 * - selectedPageId: string (account_id from social_media_accounts table)
 * 
 * Optional Body:
 * - workspaceId: string (can be derived from user if not provided)
 * - media_files: array of media objects
 * - post_type: string (e.g., 'text', 'image', 'video', 'story')
 * - user_tags: array (for Instagram stories)
 * - mediaIds: array (for X/Twitter pre-uploaded media IDs)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const resolvedParams = await params;
    let platform = resolvedParams.platform.toLowerCase();

    // Handle 'x' as alias for 'twitter'
    if (platform === 'x') {
      platform = 'twitter';
    }

    // Validate platform
    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported platform',
          message: `Platform "${platform}" is not supported. Supported platforms: ${SUPPORTED_PLATFORMS.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Get user ID from header
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required header',
          message: 'X-User-ID header is required'
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      content,
      selectedPageId,
      workspaceId: providedWorkspaceId,
      media_files = [],
      post_type = 'text',
      user_tags = [],
      mediaIds = []
    } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field',
          message: 'content is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    if (!selectedPageId || typeof selectedPageId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field',
          message: 'selectedPageId is required and must be a string'
        },
        { status: 400 }
      );
    }

    // Get workspace ID (from request or derive from user)
    let workspaceId = providedWorkspaceId;
    if (!workspaceId) {
      workspaceId = await getActiveWorkspaceId(userId);
      if (!workspaceId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Workspace not found',
            message: 'Could not determine workspace. Please provide workspaceId or ensure user has an active workspace.'
          },
          { status: 400 }
        );
      }
    }

    // Query social_media_accounts table
    const { data: account, error: accountError } = await supabase()
      .from('social_media_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .eq('account_id', selectedPageId)
      .eq('is_connected', true)
      .single();

    if (accountError || !account) {
      console.error('Account lookup error:', accountError);
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found or not connected',
          message: `No connected account found for platform "${platform}" with account_id "${selectedPageId}" in workspace "${workspaceId}"`,
          details: accountError?.message
        },
        { status: 404 }
      );
    }

    // Validate access token
    if (!account.access_token || account.access_token.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid account credentials',
          message: 'Account does not have a valid access_token'
        },
        { status: 400 }
      );
    }

    // Check if account is active
    if (!account.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is inactive',
          message: 'The social media account is marked as inactive'
        },
        { status: 400 }
      );
    }

    // Post to platform API
    let postResult;
    try {
      postResult = await postToPlatform(platform, {
        accessToken: account.access_token,
        accessTokenSecret: account.access_token_secret,
        accountId: account.account_id,
        content: content.trim(),
        mediaFiles: media_files,
        postType: post_type,
        userTags: user_tags,
        mediaIds: mediaIds,
        metadata: account.metadata || {}
      });
    } catch (platformError: any) {
      console.error(`Error posting to ${platform}:`, platformError);
      return NextResponse.json(
        {
          success: false,
          error: 'Platform API error',
          message: `Failed to post to ${platform}`,
          details: platformError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Update last_posted_at in database
    await supabase()
      .from('social_media_accounts')
      .update({ last_posted_at: new Date().toISOString() })
      .eq('id', account.id);

    // Optionally save post record to social_media_posts table
    if (postResult.postId || postResult.postUrl) {
      await supabase()
        .from('social_media_posts')
        .insert({
          account_id: account.id,
          platform: platform,
          content_type: post_type,
          content: content.trim(),
          media_urls: media_files.map((f: any) => f.url || f.data).filter(Boolean),
          post_url: postResult.postUrl || null,
          post_id: postResult.postId || null,
          status: 'posted',
          posted_at: new Date().toISOString(),
          metadata: {
            user_tags,
            mediaIds,
            ...postResult.metadata
          }
        });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully posted to ${platform}`,
      data: {
        platform,
        account_id: account.account_id,
        account_name: account.account_name,
        post_id: postResult.postId,
        post_url: postResult.postUrl,
        posted_at: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in social media post workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Post content to platform-specific API
 */
async function postToPlatform(
  platform: string,
  options: {
    accessToken: string;
    accessTokenSecret?: string | null;
    accountId: string;
    content: string;
    mediaFiles: any[];
    postType: string;
    userTags: any[];
    mediaIds: string[];
    metadata: any;
  }
): Promise<{ postId?: string; postUrl?: string; metadata?: any }> {
  const { accessToken, accessTokenSecret, accountId, content, mediaFiles, postType, userTags, mediaIds } = options;

  switch (platform) {
    case 'facebook':
      return await postToFacebook(accessToken, accountId, content, mediaFiles, postType);

    case 'twitter':
      return await postToTwitter(accessToken, accessTokenSecret, content, mediaFiles, mediaIds);

    case 'instagram':
      return await postToInstagram(accessToken, accountId, content, mediaFiles, postType, userTags);

    case 'linkedin':
      return await postToLinkedIn(accessToken, content, mediaFiles);

    case 'pinterest':
      return await postToPinterest(accessToken, accountId, content, mediaFiles);

    case 'whatsapp':
      return await postToWhatsApp(accessToken, accountId, content, mediaFiles);

    case 'email':
      return await postToEmail(accessToken, content, mediaFiles);

    default:
      throw new Error(`Platform ${platform} not implemented`);
  }
}

/**
 * Post to Facebook Graph API
 */
async function postToFacebook(
  accessToken: string,
  pageId: string,
  content: string,
  mediaFiles: any[],
  postType: string
): Promise<{ postId?: string; postUrl?: string }> {
  const graphUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;

  const payload: any = {
    message: content,
    access_token: accessToken
  };

  // Handle media if provided
  if (mediaFiles.length > 0 && postType === 'image') {
    // For images, use photos endpoint
    const photoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    const photoPayload: any = {
      message: content,
      access_token: accessToken
    };

    // Upload first image
    if (mediaFiles[0].url) {
      photoPayload.url = mediaFiles[0].url;
    } else if (mediaFiles[0].data) {
      // Handle base64 data if needed
      photoPayload.source = mediaFiles[0].data;
    }

    const photoResponse = await fetch(photoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoPayload)
    });

    if (!photoResponse.ok) {
      const error = await photoResponse.json();
      throw new Error(`Facebook API error: ${error.error?.message || 'Unknown error'}`);
    }

    const photoData = await photoResponse.json();
    return {
      postId: photoData.id,
      postUrl: `https://facebook.com/${photoData.id}`
    };
  }

  // Regular text post
  const response = await fetch(graphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    postId: data.id,
    postUrl: `https://facebook.com/${data.id}`
  };
}

/**
 * Post to Twitter/X API
 */
async function postToTwitter(
  accessToken: string,
  accessTokenSecret: string | null | undefined,
  content: string,
  mediaFiles: any[],
  mediaIds: string[]
): Promise<{ postId?: string; postUrl?: string }> {
  // Note: Twitter API v2 requires OAuth 1.0a signing
  // This is a simplified version - you may need to use a library like 'oauth-1.0a' or 'twitter-api-v2'
  
  const apiUrl = 'https://api.twitter.com/2/tweets';
  
  const payload: any = {
    text: content.substring(0, 280) // Twitter character limit
  };

  // Add media IDs if provided
  if (mediaIds.length > 0) {
    payload.media = {
      media_ids: mediaIds
    };
  }

  // For a production implementation, you'd need to properly sign the request with OAuth 1.0a
  // This is a placeholder that shows the structure
  throw new Error('Twitter/X posting requires OAuth 1.0a signing. Please use a proper Twitter API client library.');
}

/**
 * Post to Instagram Graph API
 */
async function postToInstagram(
  accessToken: string,
  accountId: string,
  content: string,
  mediaFiles: any[],
  postType: string,
  userTags: any[]
): Promise<{ postId?: string; postUrl?: string }> {
  if (postType === 'story') {
    // Instagram Stories API
    const storyUrl = `https://graph.facebook.com/v18.0/${accountId}/media`;
    
    if (mediaFiles.length === 0) {
      throw new Error('Instagram stories require at least one media file');
    }

    const mediaUrl = mediaFiles[0].url || mediaFiles[0].data;
    const payload = {
      image_url: mediaUrl,
      access_token: accessToken
    };

    const response = await fetch(storyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      postId: data.id,
      postUrl: `https://instagram.com/stories/${accountId}/${data.id}`
    };
  } else {
    // Regular Instagram post
    const postUrl = `https://graph.facebook.com/v18.0/${accountId}/media`;
    
    if (mediaFiles.length === 0) {
      throw new Error('Instagram posts require at least one media file');
    }

    const mediaUrl = mediaFiles[0].url || mediaFiles[0].data;
    const payload = {
      image_url: mediaUrl,
      caption: content,
      access_token: accessToken
    };

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Publish the media
    const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish`;
    const publishPayload = {
      creation_id: data.id,
      access_token: accessToken
    };

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publishPayload)
    });

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Instagram publish error: ${error.error?.message || 'Unknown error'}`);
    }

    const publishData = await publishResponse.json();
    return {
      postId: publishData.id,
      postUrl: `https://instagram.com/p/${publishData.id}`
    };
  }
}

/**
 * Post to LinkedIn API
 */
async function postToLinkedIn(
  accessToken: string,
  content: string,
  mediaFiles: any[]
): Promise<{ postId?: string; postUrl?: string }> {
  const apiUrl = 'https://api.linkedin.com/v2/ugcPosts';

  const payload = {
    author: `urn:li:person:${accessToken}`, // This should be the person URN, not token
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content
        },
        shareMediaCategory: mediaFiles.length > 0 ? 'IMAGE' : 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  // Note: LinkedIn API requires proper URNs and media uploads
  // This is a simplified version
  throw new Error('LinkedIn posting requires proper URNs and media handling. Please implement according to LinkedIn API docs.');
}

/**
 * Post to Pinterest API
 */
async function postToPinterest(
  accessToken: string,
  boardId: string,
  content: string,
  mediaFiles: any[]
): Promise<{ postId?: string; postUrl?: string }> {
  if (mediaFiles.length === 0) {
    throw new Error('Pinterest pins require at least one media file');
  }

  const apiUrl = 'https://api.pinterest.com/v5/pins';
  
  const payload = {
    board_id: boardId,
    media_source: {
      source_type: mediaFiles[0].url ? 'image_url' : 'image_base64',
      [mediaFiles[0].url ? 'url' : 'content_type']: mediaFiles[0].url || mediaFiles[0].data
    },
    title: content.substring(0, 100),
    description: content
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Pinterest API error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    postId: data.id,
    postUrl: data.url || `https://pinterest.com/pin/${data.id}`
  };
}

/**
 * Post to WhatsApp Business API
 */
async function postToWhatsApp(
  accessToken: string,
  phoneNumberId: string,
  content: string,
  mediaFiles: any[]
): Promise<{ postId?: string; postUrl?: string }> {
  const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const payload: any = {
    messaging_product: 'whatsapp',
    to: phoneNumberId, // This should be the recipient number
    type: mediaFiles.length > 0 ? 'image' : 'text',
    [mediaFiles.length > 0 ? 'image' : 'text']: mediaFiles.length > 0
      ? { link: mediaFiles[0].url }
      : { body: content }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    postId: data.messages?.[0]?.id,
    postUrl: undefined // WhatsApp doesn't have public URLs
  };
}

/**
 * Send email (if email is configured as a platform)
 */
async function postToEmail(
  accessToken: string,
  content: string,
  mediaFiles: any[]
): Promise<{ postId?: string; postUrl?: string }> {
  // Email sending would typically use SMTP or an email service API
  // This is a placeholder
  throw new Error('Email posting requires email service configuration (SMTP or email API).');
}

