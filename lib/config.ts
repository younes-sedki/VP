/**
 * Application-wide constants and configuration
 */

// Tweet limits
export const TWEET_CONFIG = {
  MAX_LENGTH: 280,
  MAX_COMMENT_LENGTH: 500,
  DEFAULT_FETCH_LIMIT: 50,
  MAX_FETCH_LIMIT: 100,
  EDIT_TIME_LIMIT_MS: 60 * 60 * 1000, // 1 hour in milliseconds
} as const

// Cache configuration
export const CACHE_CONFIG = {
  TWEETS_CACHE_KEY: 'blog_tweets_cache',
  TWEETS_CACHE_TIMESTAMP_KEY: 'blog_tweets_cache_timestamp',
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  LIKES_STORAGE_KEY: 'blog_liked_tweets',
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  COMPOSE: 'n',
  NAVIGATE_DOWN: 'j',
  NAVIGATE_UP: 'k',
  ESCAPE: 'Escape',
} as const

// Content moderation
export const MODERATION_CONFIG = {
  SPAM_KEYWORDS: [
    'buy now', 'click here', 'limited time', 'act now',
    'make money', 'get rich', 'free money', 'guaranteed',
    'no credit check', 'winner', 'congratulations', 'prize',
  ],
  MAX_REPEATED_CHARS: 5, // Maximum repeated characters (e.g., "aaaaa")
  MAX_CAPS_RATIO: 0.7, // 70% caps is considered spam
  MIN_WORDS_FOR_SPAM_CHECK: 3,
} as const

// Rate limiting (for client-side checks)
export const CLIENT_RATE_LIMITS = {
  TWEETS_PER_MINUTE: 3,
  COMMENTS_PER_MINUTE: 10,
} as const
