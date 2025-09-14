# Vendor CRM Sync Integration

This document explains the CRM sync functionality that has been integrated into the Next.js nicotine pouches application, replicating the exact same functionality from the WordPress vendor plugin.

## Overview

The CRM sync system tracks vendor interactions on single product pages for both UK and US regions, sending click data to an external CRM system while also logging analytics locally.

## Features Implemented

### 1. Vendor Click Tracking
- Tracks when users click on vendor links or buy buttons
- Captures vendor ID, product ID, vendor name, product name
- Records price, currency, pack size, session ID
- Sends data to external CRM API with proper authentication

### 2. Analytics System
- Tracks vendor card exposure using Intersection Observer
- Monitors buy button clicks and vendor link clicks
- **Tracks pack size changes** when users select different pack sizes (1, 3, 5, 10, 20, 25, 30, 50 packs)
- **Tracks price sorting** when users change sort order
- Includes session management and user engagement tracking
- Logs all events to local analytics database
- **Google Analytics 4 integration** with same measurement ID as WordPress plugin (G-9FT722JELW)

### 3. Google Analytics 4 Integration
- **Same measurement ID** as WordPress plugin: `G-9FT722JELW`
- **Vendor exposure events** tracked when vendor cards become visible
- **Vendor click events** tracked for all vendor interactions
- **Purchase conversion events** tracked for buy button clicks
- **Pack size change events** tracked when users change pack selection
- **Price sort events** tracked when users change sort order
- **Comparison view events** tracked when users view vendor comparisons
- **Custom parameters** for vendor ID, product ID, pack size, price, currency

### 4. Multi-Region Support
- UK product pages with GBP currency tracking
- US product pages with USD currency tracking
- Automatic region detection based on currency

## Files Created/Modified

### New Files
- `src/app/api/vendor-click-tracking/route.ts` - CRM API endpoint
- `src/app/api/vendor-analytics/route.ts` - Analytics database endpoint
- `src/components/VendorAnalytics.tsx` - Frontend analytics component
- `src/components/GoogleAnalytics.tsx` - Google Analytics 4 integration
- `src/lib/gtag.ts` - Google Analytics utility functions
- `src/config/vendor-analytics.ts` - Configuration and helper functions

### Modified Files
- `src/app/product/[slug]/page.tsx` - UK single product page with CRM sync
- `src/app/us/product/[slug]/page.tsx` - US single product page with CRM sync

## Configuration

### Environment Variables
Add these to your `.env.local` file:

```env
# CRM Sync Configuration
CRM_API_URL=https://your-crm-api-endpoint.com/api/vendor-clicks
CRM_WORKSPACE_ID=your-workspace-id
VENDOR_SYNC_ENABLED=true

# Google Analytics 4 (same as WordPress plugin)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-9FT722JELW
```

### Database Schema
The system expects a `vendor_analytics` table in Supabase with the following structure:

```sql
CREATE TABLE vendor_analytics (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_type varchar(50) NOT NULL,
  vendor_id bigint,
  vendor_name varchar(255),
  product_id bigint,
  product_name varchar(255),
  event_data jsonb,
  user_ip varchar(45),
  user_agent text,
  session_id varchar(255),
  timestamp timestamptz DEFAULT NOW()
);
```

## How It Works

### 1. Vendor Card Tracking
Each vendor card on the product page includes these data attributes:
- `data-vendor-id` - Unique vendor identifier
- `data-vendor-name` - Vendor name
- `data-price` - Current price for tracking

### 2. Event Types Tracked
- `vendor_exposure` - When vendor card comes into view (50% visible)
- `vendor_click` - When user clicks on vendor link
- `vendor_conversion` - When user clicks buy button
- `pack_size_change` - When user changes pack size filter
- `price_sort` - When user changes price sorting
- `comparison_view` - When comparison page loads

### 3. Data Flow
1. User interacts with vendor card (exposure/click)
2. Frontend `VendorAnalytics` component captures event
3. Event data sent to `/api/vendor-click-tracking` endpoint
4. API validates data and sends to external CRM
5. Event also logged to local `vendor_analytics` table
6. Response sent back to frontend

## CRM API Integration

The system sends data to your CRM API with this structure:

```json
{
  "workspace_id": "your-workspace-id",
  "vendor_id": "123",
  "vendor_name": "Vendor Name",
  "product_id": "456",
  "product_name": "Product Name",
  "pack_size": "1",
  "price": 4.99,
  "currency": "£",
  "region": "UK",
  "click_timestamp": "2024-01-01T12:00:00.000Z",
  "user_ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "referrer": "https://example.com",
  "session_id": "session_1234567890_abc123",
  "store_id": "nicotine-pouches-nextjs",
  "test_mode": false,
  "user_id": "anonymous_xyz789"
}
```

## Testing

### Enable/Disable CRM Sync
Set `VENDOR_SYNC_ENABLED=false` in environment variables to disable CRM sync while keeping local analytics.

### Debug Mode
Check browser console for tracking logs:
- "Vendor Exposure Tracked:" - When vendor cards come into view
- "Vendor Click Tracked:" - When users click vendor elements
- "CRM tracking successful:" - When data is sent to CRM successfully

### Manual Testing
You can manually trigger tracking using the global `vendorAnalytics` object:
```javascript
// In browser console
window.vendorAnalytics.trackVendorClick({
  vendor_id: '123',
  vendor_name: 'Test Vendor',
  price: 4.99,
  currency: 'GBP',
  pack_size: 1
}, 'product-456', 'Test Product');
```

## Migration from WordPress Plugin

This implementation maintains **EXACT** compatibility with the WordPress plugin:

### Identical Data Structure
- **Exact same CRM API payload format** with all field names matching
- **Same event types and tracking logic** (vendor_exposure, vendor_click, vendor_conversion)
- **Identical session management** using same session ID format
- **Same database schema** with identical field names and types
- **Same headers** (X-API-Key, X-WP-Source, User-Agent)

### Identical Tracking Behavior
- Vendor exposure tracking with 50% visibility threshold
- Click tracking for buy buttons and vendor links
- **Pack size change tracking** when users select different pack sizes (1, 3, 5, 10, 20, 25, 30, 50 packs)
- **Price sorting event tracking** when users change sort order
- **Same analytics handler** structure as WordPress

### Exact Data Values
- `store_id: 'wordpress-store'` (same as WordPress get_option('blogname', 'wordpress-store'))
- `test_mode: process.env.NODE_ENV === 'development'` (same as WordPress defined('WP_DEBUG') && WP_DEBUG)
- `user_id: 'anonymous_' + uniqid()` (exact same format)
- `click_timestamp: ISO format` (same as WordPress current_time('c'))
- `session_id: 'wp_' + timestamp + '_' + random` (same format as WordPress)

## Troubleshooting

### Common Issues

1. **CRM API not receiving data**
   - Check `CRM_API_URL` and `CRM_WORKSPACE_ID` environment variables
   - Verify `VENDOR_SYNC_ENABLED=true`
   - Check browser console for error messages

2. **Analytics not tracking**
   - Ensure vendor cards have `data-vendor-id` attributes
   - Check that `VendorAnalytics` component is rendered
   - Verify Supabase connection

3. **Currency/Region issues**
   - UK pages should use GBP currency
   - US pages should use USD currency
   - Check `getRegionFromCurrency` function

### Debug Steps

1. Check environment variables are loaded
2. Verify CRM API endpoint is accessible
3. Check Supabase `vendor_analytics` table exists
4. Monitor browser console for tracking logs
5. Test with `VENDOR_SYNC_ENABLED=false` to isolate issues

## Security Considerations

- All user data is sanitized before sending to CRM
- IP addresses are properly handled for privacy
- Session IDs are generated securely
- API keys are stored as environment variables
- No sensitive data is logged in console (production mode)
