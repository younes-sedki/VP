# Auto News Upload Feature Documentation

## Overview

The auto news upload feature automatically fetches and displays the latest web development, AI, and tech news from free public APIs. This feature is integrated into the blog page and provides real-time updates without requiring manual intervention.

## How It Works

### 1. **API Endpoint** (`/api/news`)

The news API route (`app/api/news/route.ts`) fetches news from multiple free sources:

#### **Data Sources:**

1. **Dev.to API** (https://dev.to/api)
   - Fetches web development articles tagged with `webdev`
   - Fetches AI articles tagged with `ai`, `artificial-intelligence`, `machine-learning`, `openai`, `chatgpt`
   - No API key required (free)
   - Rate limit: Respects Dev.to's rate limits
   - Cache: 1 hour (3600 seconds)

2. **Hacker News API** (https://hacker-news.firebaseio.com)
   - Fetches top tech stories
   - No API key required (completely free)
   - Rate limit: No strict limits
   - Cache: 10 minutes (600 seconds)

### 2. **Fetching Process**

```typescript
// The API route handles multiple sources in parallel:
const [devTo, hackerNews, aiArticles, aiAgents] = await Promise.all([
  fetchDevToArticles(limit),
  fetchHackerNews(limit),
  fetchAIArticles(limit),
  fetchAIAgentsNews(limit),
])
```

**Process Flow:**
1. Client requests news from `/api/news?category=all&limit=20`
2. Server fetches from all sources in parallel
3. Results are merged and sorted by publication date (newest first)
4. Duplicates are removed
5. Results are cached for performance
6. Response is sent to client

### 3. **Client-Side Display**

The `NewsFeed` component (`components/news-feed.tsx`):
- Uses the `useNews` hook to fetch data
- Displays news items with:
  - Title and description
  - Source and author
  - Publication time (relative, e.g., "2 hours ago")
  - Category badges (webdev, AI, tech)
  - Tags
  - Images (when available)
- Supports category filtering (All, Web Dev, AI, Tech)
- Auto-refreshes on category change

### 4. **Caching Strategy**

- **Server-side caching**: Uses Next.js `revalidate` option
  - Dev.to: 1 hour cache
  - Hacker News: 10 minutes cache
- **Client-side**: Component only fetches when mounted
- **Rate limiting**: Applied to prevent abuse

## Features

### Category Filtering
- **All**: Shows news from all categories
- **Web Dev**: Shows web development articles from Dev.to
- **AI**: Shows AI-related articles from Dev.to
- **Tech**: Shows Hacker News top stories

### Automatic Updates
- News is fetched automatically when:
  - Component mounts
  - Category filter changes
  - User clicks "Retry" after an error

### Error Handling
- Graceful degradation: If one source fails, others still work
- Error messages displayed to user
- Retry functionality
- Empty state handling

## API Usage

### Endpoint
```
GET /api/news?category=all&limit=20
```

### Query Parameters
- `category` (optional): `'all' | 'webdev' | 'ai' | 'tech'` (default: `'all'`)
- `limit` (optional): Number of items to return (default: `20`, max: `50`)

### Response Format
```json
{
  "news": [
    {
      "id": "devto-12345",
      "title": "Article Title",
      "description": "Article description...",
      "url": "https://dev.to/...",
      "source": "Dev.to",
      "author": "Author Name",
      "publishedAt": "2024-01-01T00:00:00Z",
      "imageUrl": "https://...",
      "tags": ["webdev", "javascript"],
      "category": "webdev"
    }
  ],
  "count": 20,
  "category": "all"
}
```

## Rate Limiting

The news API uses the same rate limiting as other endpoints:
- **Default limit**: 100 requests per minute per IP
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Security

- ✅ Input validation on query parameters
- ✅ Rate limiting to prevent abuse
- ✅ CORS headers configured
- ✅ Error handling to prevent information leakage
- ✅ Content sanitization (handled by source APIs)

## Performance

- **Parallel fetching**: All sources fetched simultaneously
- **Caching**: Reduces API calls and improves response time
- **Lazy loading**: Images load only when visible
- **Client-side only**: No SSR to prevent layout router issues

## Customization

### Adding New Sources

To add a new news source:

1. Create a fetch function in `app/api/news/route.ts`:
```typescript
async function fetchNewSource(limit: number): Promise<NewsItem[]> {
  // Fetch logic here
  return newsItems
}
```

2. Add it to the parallel fetch in the GET handler:
```typescript
const newSource = await fetchNewSource(limit)
newsItems.push(...newSource)
```

### Changing Cache Duration

Modify the `revalidate` option in fetch calls:
```typescript
{
  next: { revalidate: 3600 } // seconds
}
```

### Customizing Display

Edit `components/news-feed.tsx` to:
- Change layout
- Add/remove fields
- Modify styling
- Add new interactions

## Troubleshooting

### News Not Loading
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check rate limit status
4. Try refreshing the page

### Slow Loading
1. Check network connection
2. Verify cache is working (check response headers)
3. Reduce limit parameter
4. Check if external APIs are slow

### Missing News
- Some sources may have rate limits
- Cache may be serving stale data
- External APIs may be temporarily unavailable

## Future Enhancements

Potential improvements:
- [ ] Add more news sources (Reddit, Medium, etc.)
- [ ] RSS feed parsing
- [ ] User preferences for news sources
- [ ] Bookmark/save news items
- [ ] Search functionality
- [ ] Real-time updates via WebSocket
- [ ] News categories customization
- [ ] Email digest option
