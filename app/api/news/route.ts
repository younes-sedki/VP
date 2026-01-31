import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { NewsItem } from '@/lib/types'

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

// Fetch Dev.to articles
async function fetchDevToArticles(limit: number = 10): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `https://dev.to/api/articles?tag=webdev&per_page=${limit}`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )
    
    if (!response.ok) return []
    
    const articles = await response.json()
    
    return articles.map((article: any) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description || article.excerpt || '',
      url: article.url,
      source: 'Dev.to',
      author: article.user?.name || article.user?.username,
      publishedAt: article.published_at || article.created_at,
      imageUrl: article.cover_image || article.social_image,
      tags: article.tags || [],
      category: 'webdev' as const,
    }))
  } catch (error) {
    console.error('Error fetching Dev.to articles:', error)
    return []
  }
}

// Fetch Hacker News top stories
async function fetchHackerNews(limit: number = 10): Promise<NewsItem[]> {
  try {
    // Get top story IDs
    const topStoriesResponse = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      {
        next: { revalidate: 600 } // Cache for 10 minutes
      }
    )
    
    if (!topStoriesResponse.ok) return []
    
    const storyIds: number[] = await topStoriesResponse.json()
    const topStoryIds = storyIds.slice(0, limit)
    
    // Fetch story details
    const storyPromises = topStoryIds.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 600 }
      }).then(res => res.json())
    )
    
    const stories = await Promise.all(storyPromises)
    
    return stories
      .filter((story: any) => story && story.type === 'story' && story.title)
      .map((story: any) => ({
        id: `hn-${story.id}`,
        title: story.title,
        description: '',
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: 'Hacker News',
        author: story.by,
        publishedAt: new Date(story.time * 1000).toISOString(),
        tags: [],
        category: 'tech' as const,
      }))
  } catch (error) {
    console.error('Error fetching Hacker News:', error)
    return []
  }
}

// Fetch AI-related articles from Dev.to
async function fetchAIArticles(limit: number = 5): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `https://dev.to/api/articles?tag=ai&per_page=${limit}`,
      {
        next: { revalidate: 3600 }
      }
    )
    
    if (!response.ok) return []
    
    const articles = await response.json()
    
    return articles.map((article: any) => ({
      id: `devto-ai-${article.id}`,
      title: article.title,
      description: article.description || article.excerpt || '',
      url: article.url,
      source: 'Dev.to',
      author: article.user?.name || article.user?.username,
      publishedAt: article.published_at || article.created_at,
      imageUrl: article.cover_image || article.social_image,
      tags: article.tags || [],
      category: 'ai' as const,
    }))
  } catch (error) {
    console.error('Error fetching AI articles:', error)
    return []
  }
}

// Fetch free AI agents/news from GitHub trending or other sources
async function fetchAIAgentsNews(limit: number = 5): Promise<NewsItem[]> {
  try {
    // Use Dev.to with multiple AI-related tags
    const tags = ['artificial-intelligence', 'machine-learning', 'openai', 'chatgpt']
    const allArticles: NewsItem[] = []
    
    for (const tag of tags.slice(0, 2)) {
      const response = await fetch(
        `https://dev.to/api/articles?tag=${tag}&per_page=${Math.ceil(limit / 2)}`,
        {
          next: { revalidate: 3600 }
        }
      )
      
      if (response.ok) {
        const articles = await response.json()
        const mapped = articles.map((article: any) => ({
          id: `devto-${tag}-${article.id}`,
          title: article.title,
          description: article.description || article.excerpt || '',
          url: article.url,
          source: 'Dev.to',
          author: article.user?.name || article.user?.username,
          publishedAt: article.published_at || article.created_at,
          imageUrl: article.cover_image || article.social_image,
          tags: article.tags || [],
          category: 'ai' as const,
        }))
        allArticles.push(...mapped)
      }
    }
    
    // Remove duplicates and limit
    const unique = Array.from(
      new Map(allArticles.map(item => [item.id, item])).values()
    ).slice(0, limit)
    
    return unique
  } catch (error) {
    console.error('Error fetching AI agents news:', error)
    return []
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(clientId, RATE_LIMITS.default)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          ...corsHeaders(),
          'X-RateLimit-Limit': RATE_LIMITS.default.max.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        }
      }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'all' // 'all', 'webdev', 'ai', 'tech'
    const limit = parseInt(searchParams.get('limit') || '20')
    const clampedLimit = Math.min(Math.max(limit, 1), 50)

    let newsItems: NewsItem[] = []

    // Fetch news based on category
    if (category === 'all' || category === 'webdev') {
      const [devTo, hackerNews] = await Promise.all([
        fetchDevToArticles(Math.ceil(clampedLimit / 2)),
        fetchHackerNews(Math.ceil(clampedLimit / 2)),
      ])
      newsItems.push(...devTo, ...hackerNews)
    }

    if (category === 'all' || category === 'ai') {
      const [aiArticles, aiAgents] = await Promise.all([
        fetchAIArticles(Math.ceil(clampedLimit / 2)),
        fetchAIAgentsNews(Math.ceil(clampedLimit / 2)),
      ])
      newsItems.push(...aiArticles, ...aiAgents)
    }

    if (category === 'tech') {
      const hackerNews = await fetchHackerNews(clampedLimit)
      newsItems.push(...hackerNews)
    }

    // Sort by published date (newest first)
    newsItems.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    // Remove duplicates and limit results
    const uniqueNews = Array.from(
      new Map(newsItems.map(item => [item.id, item])).values()
    ).slice(0, clampedLimit)

    return NextResponse.json(
      { 
        news: uniqueNews,
        count: uniqueNews.length,
        category,
      },
      { 
        status: 200,
        headers: {
          ...corsHeaders(),
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        }
      }
    )
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news', news: [], count: 0 },
      { status: 500, headers: corsHeaders() }
    )
  }
}
