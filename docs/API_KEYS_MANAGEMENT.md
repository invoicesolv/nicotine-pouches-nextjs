# API Keys Management Documentation

## Overview

The API Keys Management system allows you to store and manage API keys for CRM integrations directly in the database, without needing to set environment variables.

## Database Table

**Table:** `api_keys`

**Fields:**
- `id` (UUID): Primary key
- `name` (TEXT): Name/identifier for the API key
- `key_type` (TEXT): Type of key - `'crm'`, `'crawler'`, or `'custom'`
- `key_value` (TEXT): Encrypted API key value
- `description` (TEXT): Optional description
- `workspace_id` (UUID): Workspace that owns this key
- `is_active` (BOOLEAN): Whether the key is active
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp
- `created_by` (UUID): User who created the key
- `last_used_at` (TIMESTAMP): Last time the key was used
- `usage_count` (INTEGER): Number of times the key has been used

## Endpoints

### 1. List API Keys

**GET** `/api/api-keys`

**Headers:**
- `X-User-ID`: User UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "CRM Production Key",
      "key_type": "crm",
      "description": "Main API key for CRM integration",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "last_used_at": "2024-01-20T14:30:00Z",
      "usage_count": 42
    }
  ]
}
```

**Note:** The actual key value is never returned for security reasons.

---

### 2. Create API Key

**POST** `/api/api-keys`

**Headers:**
- `X-User-ID`: User UUID
- `Content-Type: application/json`

**Body:**
```json
{
  "name": "CRM Production Key",
  "key_type": "crm",
  "key_value": "your-actual-api-key-here",
  "description": "Main API key for CRM integration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "uuid",
    "name": "CRM Production Key",
    "key_type": "crm",
    "description": "Main API key for CRM integration",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### 3. Get API Key

**GET** `/api/api-keys/[id]`

**Headers:**
- `X-User-ID`: User UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "CRM Production Key",
    "key_type": "crm",
    "description": "Main API key for CRM integration",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "last_used_at": "2024-01-20T14:30:00Z",
    "usage_count": 42
  }
}
```

---

### 4. Update API Key

**PUT** `/api/api-keys/[id]`

**Headers:**
- `X-User-ID`: User UUID
- `Content-Type: application/json`

**Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "key_value": "new-api-key-value",
  "description": "Updated description",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "key_type": "crm",
    "description": "Updated description",
    "is_active": true,
    "updated_at": "2024-01-20T15:00:00Z"
  }
}
```

---

### 5. Delete API Key

**DELETE** `/api/api-keys/[id]`

**Headers:**
- `X-User-ID`: User UUID

**Response:**
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

---

## How Guides Endpoint Uses API Keys

The `/api/guides` endpoint checks API keys in this order:

1. **Environment Variables** (backward compatibility):
   - `CRM_API_KEY` (if set)
   - Falls back to `CRAWLER_API_KEY` (if `CRM_API_KEY` not set)

2. **Database** (new):
   - Checks all active API keys with `key_type = 'crm'`
   - Compares the provided key against stored keys
   - Updates usage stats when a key is used

### Authentication Flow

```
1. Request comes in with API key
2. Check environment variables first (for backward compatibility)
3. If not found, check database for CRM API keys
4. Decrypt and compare keys
5. If match found:
   - Update last_used_at
   - Increment usage_count
   - Allow request
6. If no match:
   - Return 401 Unauthorized
```

## Example: Creating and Using an API Key

### Step 1: Create API Key via API

```bash
curl -X POST https://nicotine-pouches.org/api/api-keys \
  -H "X-User-ID: your-user-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Production Key",
    "key_type": "crm",
    "key_value": "my-secret-api-key-12345",
    "description": "Main API key for CRM"
  }'
```

### Step 2: Use API Key for Guides Endpoint

```bash
curl -X POST https://nicotine-pouches.org/api/guides \
  -H "Authorization: Bearer my-secret-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Guide",
    "excerpt": "Description",
    "content": "<h1>Content</h1>"
  }'
```

## Security Notes

1. **Encryption**: API keys are base64 encoded before storage (in production, use proper encryption)
2. **Never Exposed**: API key values are never returned in API responses
3. **Workspace Isolation**: API keys are scoped to workspaces
4. **Usage Tracking**: All key usage is tracked (last_used_at, usage_count)
5. **Active Status**: Keys can be deactivated without deletion

## Migration from Environment Variables

If you're currently using environment variables:

1. **Option 1**: Keep using environment variables (no changes needed)
2. **Option 2**: Create API keys in database and remove environment variables
3. **Option 3**: Use both (environment variables checked first, then database)

The system supports all three options for smooth migration.


