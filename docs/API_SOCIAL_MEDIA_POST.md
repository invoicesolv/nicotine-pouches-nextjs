# Social Media Posting API Documentation

## Overview

The Social Media Posting API allows you to post content directly to various social media platforms using stored account credentials from your CRM system.

## Endpoint

**POST** `/api/social/{platform}/post/workflow`

Where `{platform}` is one of: `facebook`, `twitter`, `instagram`, `linkedin`, `pinterest`, `whatsapp`, `email`

Note: `x` is accepted as an alias for `twitter`.

## Authentication

**Required Header:**
- `X-User-ID`: User UUID (the user making the post request)

## Request Body

### Required Parameters

- **content** (string): The post content/text
- **selectedPageId** (string): The `account_id` from the `social_media_accounts` table

### Optional Parameters

- **workspaceId** (string): Workspace UUID. If not provided, will be derived from the user's active workspace
- **media_files** (array): Array of media objects with `url` or `data` (base64) properties
- **post_type** (string): Type of post - `'text'`, `'image'`, `'video'`, `'story'` (default: `'text'`)
- **user_tags** (array): For Instagram stories - array of user tags
- **mediaIds** (array): For X/Twitter - pre-uploaded media IDs

## Example Request

```bash
curl -X POST https://nicotine-pouches.org/api/social/facebook/post/workflow \
  -H "X-User-ID: user-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out our latest guide on nicotine pouches!",
    "selectedPageId": "863639766840991",
    "workspaceId": "workspace-uuid",
    "mediaFiles": [
      {
        "url": "https://example.com/image.jpg"
      }
    ],
    "postType": "image"
  }'
```

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Successfully posted to facebook",
  "data": {
    "platform": "facebook",
    "account_id": "863639766840991",
    "account_name": "Nicotine Pouches Page",
    "post_id": "123456789",
    "post_url": "https://facebook.com/123456789",
    "posted_at": "2024-01-15T10:00:00Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Header

```json
{
  "success": false,
  "error": "Missing required header",
  "message": "X-User-ID header is required"
}
```

#### 400 Bad Request - Missing Required Field

```json
{
  "success": false,
  "error": "Missing required field",
  "message": "content is required and must be a non-empty string"
}
```

#### 400 Bad Request - Unsupported Platform

```json
{
  "success": false,
  "error": "Unsupported platform",
  "message": "Platform \"tiktok\" is not supported. Supported platforms: facebook, twitter, instagram, linkedin, pinterest, whatsapp, email"
}
```

#### 404 Not Found - Account Not Found

```json
{
  "success": false,
  "error": "Account not found or not connected",
  "message": "No connected account found for platform \"facebook\" with account_id \"863639766840991\" in workspace \"workspace-uuid\""
}
```

#### 500 Internal Server Error - Platform API Error

```json
{
  "success": false,
  "error": "Platform API error",
  "message": "Failed to post to facebook",
  "details": "Invalid access token"
}
```

## How It Works

1. **Authentication**: Validates the `X-User-ID` header
2. **Workspace Resolution**: Gets workspace ID from request or derives it from user's active workspace
3. **Account Lookup**: Queries `social_media_accounts` table with:
   - `workspace_id` = workspaceId
   - `platform` = {platform}
   - `account_id` = selectedPageId
   - `is_connected` = true
4. **Token Validation**: Ensures account has a valid `access_token`
5. **Platform API Call**: Posts to the platform's API using the stored credentials
6. **Database Update**: Updates `last_posted_at` and optionally saves post record to `social_media_posts` table

## Database Requirements

The account must exist in the `social_media_accounts` table with:

- `workspace_id`: UUID matching the workspace
- `platform`: One of the supported platforms
- `account_id`: The ID you pass as `selectedPageId`
- `is_connected`: Must be `true`
- `is_active`: Must be `true`
- `access_token`: Must be present and valid

## Platform-Specific Notes

### Facebook
- Supports text posts and image posts
- Uses Facebook Graph API v18.0
- For images, uses the `/photos` endpoint

### Twitter/X
- Currently requires OAuth 1.0a signing (not fully implemented)
- Supports text posts with optional media IDs
- Character limit: 280 characters

### Instagram
- Requires at least one media file for posts
- Supports regular posts and stories
- Uses Instagram Graph API
- Stories require `post_type: 'story'`

### LinkedIn
- Requires proper URNs (not fully implemented)
- Supports text posts with optional media

### Pinterest
- Requires at least one media file
- Uses Pinterest API v5
- Requires `board_id` in account metadata

### WhatsApp
- Uses WhatsApp Business API
- Requires `phone_number_id` in account metadata
- Supports text and image messages

### Email
- Requires email service configuration (not fully implemented)

## Integration Example

### JavaScript/TypeScript

```typescript
async function postToSocialMedia(
  platform: string,
  userId: string,
  content: string,
  accountId: string,
  options?: {
    workspaceId?: string;
    mediaFiles?: any[];
    postType?: string;
  }
) {
  const response = await fetch(
    `https://nicotine-pouches.org/api/social/${platform}/post/workflow`,
    {
      method: 'POST',
      headers: {
        'X-User-ID': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        selectedPageId: accountId,
        workspaceId: options?.workspaceId,
        media_files: options?.mediaFiles || [],
        post_type: options?.postType || 'text'
      })
    }
  );

  return await response.json();
}

// Usage
const result = await postToSocialMedia(
  'facebook',
  'user-uuid',
  'Check out our latest guide!',
  '863639766840991',
  {
    mediaFiles: [{ url: 'https://example.com/image.jpg' }],
    postType: 'image'
  }
);
```

## Notes

- The endpoint automatically saves successful posts to the `social_media_posts` table
- Failed posts are not saved to the database
- The `last_posted_at` timestamp is updated on the account record after successful posts
- Platform-specific implementations may need additional configuration or libraries
- Some platforms (Twitter, LinkedIn, Email) require additional setup or libraries for full functionality

