import { useCallback, useState } from 'react'
import type { Tweet } from '@/lib/types'
import { CACHE_CONFIG } from '@/lib/config'

export function useTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tweets with pagination and caching
  const fetchTweets = useCallback(async (limit = 50, offset = 0, useCache = true) => {
    setLoading(true)
    setError(null)
    
    // Check cache first
    if (useCache && typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem(CACHE_CONFIG.TWEETS_CACHE_KEY)
        const cacheTimestamp = localStorage.getItem(CACHE_CONFIG.TWEETS_CACHE_TIMESTAMP_KEY)
        
        if (cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp, 10)
          if (cacheAge < 5 * 60 * 1000) { // 5 minutes cache
            const parsed = JSON.parse(cachedData)
            if (parsed.tweets && Array.isArray(parsed.tweets)) {
              setTweets(parsed.tweets)
              setLoading(false)
              // Still fetch in background to update cache
              fetch(`/api/tweets?limit=${limit}&offset=${offset}`)
                .then(res => res.json())
                .then(data => {
                  if (data.tweets && Array.isArray(data.tweets)) {
                    localStorage.setItem(CACHE_CONFIG.TWEETS_CACHE_KEY, JSON.stringify(data))
                    localStorage.setItem(CACHE_CONFIG.TWEETS_CACHE_TIMESTAMP_KEY, Date.now().toString())
                    setTweets(data.tweets)
                  }
                })
                .catch(() => {}) // Silent fail for background update
              return parsed
            }
          }
        }
      } catch (err) {
        // Cache error, continue with fetch
      }
    }
    
    try {
      const response = await fetch(`/api/tweets?limit=${limit}&offset=${offset}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch tweets')
      }
      
      const data = await response.json()
      if (data.tweets && Array.isArray(data.tweets)) {
        setTweets(data.tweets)
        // Update cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_CONFIG.TWEETS_CACHE_KEY, JSON.stringify(data))
          localStorage.setItem(CACHE_CONFIG.TWEETS_CACHE_TIMESTAMP_KEY, Date.now().toString())
        }
      } else {
        console.warn('Invalid tweets data format:', data)
        setTweets([])
      }
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching tweets:', err)
      setError(message)
      setTweets([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new tweet with optimistic update
  const createTweet = useCallback(async (content: string, author: string, handle: string, email?: string) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticTweet = {
      id: tempId,
      author,
      handle,
      avatar: 'user',
      avatarImage: '/placeholder-user.jpg',
      content,
      created_at: new Date().toISOString(),
      likes: 0,
      comments: [],
      retweets: 0,
      replies: 0,
    } as any
    
    setTweets(prev => [optimisticTweet, ...prev])
    
    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author, handle, email })
      })
      
      if (!response.ok) {
        // Rollback on error
        setTweets(prev => prev.filter(t => t.id !== tempId))
        throw new Error('Failed to create tweet')
      }
      
      const data = await response.json()
      // Replace optimistic tweet with real one
      setTweets(prev => prev.map(t => t.id === tempId ? data.tweet : t))
      
      // Invalidate cache
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_CONFIG.TWEETS_CACHE_KEY)
      }
      
      return data.tweet
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    }
  }, [])

  // Update tweet (likes, comments, etc) with optimistic update
  const updateTweet = useCallback(async (tweetId: string, updates: Partial<Tweet>, isAdmin = false) => {
    // Optimistic update
    const previousTweets = [...tweets]
    setTweets(prev =>
      prev.map(tweet =>
        tweet.id === tweetId ? { ...tweet, ...updates } : tweet
      )
    )
    
    try {
      const response = await fetch('/api/tweets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId, isAdmin, ...updates })
      })
      
      if (!response.ok) {
        // Rollback on error
        setTweets(previousTweets)
        throw new Error('Failed to update tweet')
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    }
  }, [tweets])

  // Edit tweet (content only, within 1 hour)
  const editTweet = useCallback(async (tweetId: string, newContent: string, isAdmin = false) => {
    // Optimistic update
    const previousTweets = [...tweets]
    setTweets(prev =>
      prev.map(tweet =>
        tweet.id === tweetId 
          ? { ...tweet, content: newContent, updatedAt: new Date().toISOString(), edited: true } as any
          : tweet
      )
    )
    
    try {
      const response = await fetch('/api/tweets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId, content: newContent, isAdmin })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        // Rollback on error
        setTweets(previousTweets)
        throw new Error(errorData.error || 'Failed to edit tweet')
      }
      
      const data = await response.json()
      // Update with server response
      setTweets(prev =>
        prev.map(tweet =>
          tweet.id === tweetId ? data.tweet : tweet
        )
      )
      
      // Invalidate cache
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_CONFIG.TWEETS_CACHE_KEY)
      }
      
      return data.tweet
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    }
  }, [tweets])

  // Delete a tweet
  const deleteTweet = useCallback(async (tweetId: string, isAdmin = false) => {
    try {
      const response = await fetch('/api/tweets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId, isAdmin })
      })
      
      if (!response.ok) throw new Error('Failed to delete tweet')
      
      setTweets(prev => prev.filter(tweet => tweet.id !== tweetId))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    }
  }, [])

  return {
    tweets,
    loading,
    error,
    fetchTweets,
    createTweet,
    updateTweet,
    editTweet,
    deleteTweet
  }
}
