# Guides API Endpoint Documentation

## Overview

The Guides API allows you to create, read, update, and delete blog posts/guides directly from your CRM system. All endpoints require authentication using an API key.

## Authentication

All POST, PUT, and DELETE requests require authentication using one of the following methods:

1. **Authorization Header (Recommended)**:
   ```
   Authorization: Bearer YOUR_API_KEY
   ```

2. **Query Parameter**:
   ```
   ?apiKey=YOUR_API_KEY
   ```

### Environment Variable

Set the API key in your environment variables:
```bash
CRM_API_KEY=your-secret-api-key-here
```

If `CRM_API_KEY` is not set, the system will fall back to `CRAWLER_API_KEY`.

## Endpoints

### 1. Create a New Guide

**POST** `/api/guides`

Creates a new guide/blog post.

#### Request Body

**Required Parameters:**
- `title` (string): Post title
- `content` (string): HTML content
- `excerpt` (string): Short description

**Optional Parameters:**
- `slug` (string): URL slug (auto-generated from title if not provided)
- `status` (string): `'publish'` | `'draft'` (default: `'publish'`)
- `author` (string): Author name (defaults to "Nicotine Pouches Team")
- `featured_image_url` (string): Featured image URL
- `featured_image_alt` (string): Alt text for featured image
- `category` (string): Post category (single category)
- `categories` (array): Array of category IDs (alternative to `category`)
- `tags` (array): Array of tag IDs
- `seo_meta` (object): SEO metadata object
  - `title` (string): SEO title
  - `description` (string): SEO description
  - `keywords` (string): Comma-separated keywords
  - `og_title` (string): Open Graph title
  - `og_description` (string): Open Graph description
  - `og_image` (string): Open Graph image URL
  - `canonical` (string): Canonical URL
  - `robots` (string): Robots meta tag value

```json
{
  "title": "Your Guide Title",
  "excerpt": "Short description",
  "content": "<h1>Full HTML content</h1>",
  "slug": "your-guide-slug",
  "status": "publish",
  "seo_meta": {
    "title": "SEO Title",
    "description": "SEO Description"
  },
  "featured_image_url": "https://example.com/image.jpg",
  "featured_image_alt": "Alt text for image",
  "category": "Guides"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Guide created successfully",
  "data": {
    "id": 1,
    "title": "Your Guide Title",
    "slug": "your-guide-slug",
    "excerpt": "Short description",
    "content": "<h1>Full HTML content</h1>",
    "url": "https://nicotine-pouches.org/guides/your-guide-slug",
    "status": "publish",
    "created_at": "2024-01-15T10:00:00Z",
    ...
  }
}
```

#### Example cURL

```bash
curl -X POST https://nicotine-pouches.org/api/guides \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Guide Title",
    "excerpt": "Short description",
    "content": "<h1>Full HTML content</h1>",
    "status": "publish",
    "seo_meta": {
      "title": "SEO Title",
      "description": "SEO Description"
    },
    "featured_image_url": "https://example.com/image.jpg"
  }'
```

---

### 2. Get All Guides

**GET** `/api/guides`

Retrieves a list of guides. No authentication required for GET requests.

#### Query Parameters

- `status` (optional): Filter by status (`publish`, `draft`, `private`, `pending`, or `all`). Default: `publish`
- `limit` (optional): Number of results to return. Default: `100`
- `offset` (optional): Number of results to skip. Default: `0`

#### Example

```bash
curl https://nicotine-pouches.org/api/guides?status=publish&limit=10
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Guide Title",
      "slug": "guide-slug",
      ...
    }
  ],
  "count": 10
}
```

---

### 3. Get a Specific Guide

**GET** `/api/guides/[slug]`

Retrieves a single guide by its slug. No authentication required.

#### Example

```bash
curl https://nicotine-pouches.org/api/guides/how-to-choose-nicotine-pouches
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Guide Title",
    "slug": "guide-slug",
    ...
  }
}
```

---

### 4. Update an Existing Guide

**PUT** `/api/guides/[slug]`

Updates an existing guide. Requires authentication.

#### Request Body

Same as POST, but all fields are optional. Only provided fields will be updated.

#### Example cURL

```bash
curl -X PUT https://nicotine-pouches.org/api/guides/your-guide-slug \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "publish",
    "content": "<h1>Updated Content</h1>"
  }'
```

#### Response

```json
{
  "success": true,
  "message": "Guide updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    ...
  }
}
```

---

### 5. Delete a Guide

**DELETE** `/api/guides/[slug]`

Deletes a guide. Requires authentication.

#### Example cURL

```bash
curl -X DELETE https://nicotine-pouches.org/api/guides/your-guide-slug \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Response

```json
{
  "success": true,
  "message": "Guide deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "error": "Unauthorized. Invalid API key.",
  "message": "Please provide a valid API key in the Authorization header (Bearer token) or apiKey query parameter."
}
```

### 400 Bad Request

```json
{
  "error": "Missing required field: title"
}
```

### 404 Not Found

```json
{
  "error": "Guide not found",
  "slug": "non-existent-slug"
}
```

### 409 Conflict

```json
{
  "error": "Post with this slug already exists",
  "existing_post_id": 1,
  "slug": "duplicate-slug",
  "message": "Use PUT /api/guides/[slug] to update an existing post, or provide a different slug."
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "details": "Error message details"
}
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
const API_KEY = 'your-api-key';
const API_URL = 'https://nicotine-pouches.org/api/guides';

// Create a guide
async function createGuide(guideData: any) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(guideData)
  });
  
  return await response.json();
}

// Update a guide
async function updateGuide(slug: string, updates: any) {
  const response = await fetch(`${API_URL}/${slug}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
}
```

### Python

```python
import requests

API_KEY = 'your-api-key'
API_URL = 'https://nicotine-pouches.org/api/guides'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Create a guide
def create_guide(guide_data):
    response = requests.post(API_URL, json=guide_data, headers=headers)
    return response.json()

# Update a guide
def update_guide(slug, updates):
    response = requests.put(f'{API_URL}/{slug}', json=updates, headers=headers)
    return response.json()
```

---

## Notes

- **Slug Generation**: If a slug is not provided, it will be automatically generated from the title by:
  - Converting to lowercase
  - Removing special characters
  - Replacing spaces with hyphens
  - Removing leading/trailing hyphens

- **Status Values**: 
  - `publish`: Published and visible to the public
  - `draft`: Draft, not visible to the public
  - `private`: Private, requires authentication to view
  - `pending`: Pending review/approval

- **SEO Metadata**: The `seo_meta` field accepts a JSON object with any SEO-related metadata. Common fields include:
  - `title`: SEO title
  - `description`: Meta description
  - `keywords`: Comma-separated keywords
  - `og_title`, `og_description`, `og_image`: Open Graph tags
  - `canonical`: Canonical URL
  - `robots`: Robots meta tag value

- **Timestamps**: All timestamps are stored in ISO 8601 format (UTC).

