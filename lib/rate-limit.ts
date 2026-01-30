/**
 * Rate limiting utility for API endpoints
 * Simple in-memory rate limiter (for production, use Redis or similar)
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
let cleanupInterval: NodeJS.Timeout | null = null

// Initialize cleanup interval only when needed
function initCleanup() {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      const now = Date.now()
      Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
          delete store[key]
        }
      })
    }, 5 * 60 * 1000)
  }
}

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
  // Tweets
  createTweet: { max: 10, window: 60 * 1000 }, // 10 tweets per minute
  likeTweet: { max: 50, window: 60 * 1000 }, // 50 likes per minute
  commentTweet: { max: 20, window: 60 * 1000 }, // 20 comments per minute
  
  // General API
  default: { max: 100, window: 60 * 1000 }, // 100 requests per minute
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: { max: number; window: number } = RATE_LIMITS.default
): { allowed: boolean; remaining: number; resetTime: number } {
  // Initialize cleanup only when the function is actually used
  initCleanup()
  
  const now = Date.now()
  const key = identifier

  if (!store[key] || store[key].resetTime < now) {
    // Reset or create new entry
    store[key] = {
      count: 1,
      resetTime: now + limit.window,
    }
    return {
      allowed: true,
      remaining: limit.max - 1,
      resetTime: store[key].resetTime,
    }
  }

  if (store[key].count >= limit.max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  store[key].count++
  return {
    allowed: true,
    remaining: limit.max - store[key].count,
    resetTime: store[key].resetTime,
  }
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return ip
}
