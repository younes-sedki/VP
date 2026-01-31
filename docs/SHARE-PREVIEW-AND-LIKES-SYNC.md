# Share Preview Cards & Likes Syncing

## Summary

This document describes the implementation of share preview cards (Open Graph/Twitter Cards) and the fix for likes not syncing across devices.

## Part 1: Share Preview Cards

### Implementation

1. **Server-Side Metadata Generation**
   - Converted `/app/tweet/[id]/page.tsx` from client component to server component
   - Added `generateMetadata` function that generates Open Graph and Twitter Card meta tags
   - Meta tags are rendered server-side for proper preview card generation

2. **Meta Tags Included**
   - `og:title` - Tweet author and handle
   - `og:description` - Tweet content (truncated to 160 chars)
   - `og:image` - Tweet image or default OG image
   - `og:url` - Full canonical tweet URL
   - `og:type` - Set to "article"
   - `twitter:card` - Set to "summary_large_image"
   - `twitter:title` - Same as og:title
   - `twitter:description` - Same as og:description
   - `twitter:images` - Array with tweet image

3. **Enhanced Share Button**
   - Uses `navigator.share()` API when available (mobile devices)
   - Falls back to clipboard copy for desktop
   - Includes title, text, and URL in share data

### Supported Platforms

- ✅ WhatsApp
- ✅ iMessage
- ✅ Twitter/X
- ✅ Discord
- ✅ Facebook
- ✅ LinkedIn
- ✅ Any platform that supports Open Graph

## Part 2: Likes Syncing Fix

### Problem

- Likes were stored only in localStorage
- Likes didn't sync across devices
- Each device showed different like counts

### Solution

1. **API Endpoint Created**
   - `POST /api/tweets/[id]/like`
   - Accepts `{ action: 'like' | 'unlike' }` in request body
   - Updates likes count in Supabase/database
   - Returns updated likes count

2. **Storage Updated**
   - Likes are now persisted in Supabase/database
   - Each tweet's `likes` field is updated when liked/unliked
   - Works for both admin and user tweets

3. **Frontend Updated**
   - `handleLike` function now calls API endpoint
   - Optimistic UI updates for better UX
   - Reverts on error
   - localStorage still used for user's like state (UI feedback only)
   - Server likes are the source of truth

### How It Works

1. User clicks like button
2. UI updates optimistically (immediate feedback)
3. API call is made to `/api/tweets/[id]/like`
4. Server updates likes count in database
5. Response returns updated count
6. UI updates with server response

### Benefits

- ✅ Likes sync across all devices
- ✅ Consistent like counts for all users
- ✅ Real-time updates
- ✅ Optimistic UI for better UX

## Files Changed

1. `app/tweet/[id]/page.tsx` - Converted to server component with metadata
2. `app/tweet/[id]/tweet-detail-client.tsx` - New client component for tweet detail
3. `app/api/tweets/[id]/like/route.ts` - New API endpoint for likes
4. `components/twitter-post-feed.tsx` - Updated like handler and share button

## Testing

### Share Preview Cards
1. Share a tweet link on WhatsApp/iMessage
2. Verify preview card shows:
   - Tweet author and content
   - Tweet image (if available)
   - Proper title and description

### Likes Syncing
1. Like a tweet on Device A
2. Check like count on Device B
3. Verify count matches
4. Unlike on Device B
5. Verify count decreases on Device A
