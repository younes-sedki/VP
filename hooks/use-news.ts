'use client'

import { useState, useEffect, useCallback } from 'react'
import { NewsItem } from '@/lib/types'

interface UseNewsOptions {
  category?: 'all' | 'webdev' | 'ai' | 'tech'
  limit?: number
  autoFetch?: boolean
}

export function useNews(options: UseNewsOptions = {}) {
  const { category = 'all', limit = 20, autoFetch = true } = options
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        category,
        limit: limit.toString(),
      })
      
      const response = await fetch(`/api/news?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      
      const data = await response.json()
      setNews(data.news || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      setNews([])
    } finally {
      setLoading(false)
    }
  }, [category, limit])

  useEffect(() => {
    if (autoFetch && typeof window !== 'undefined') {
      fetchNews()
    }
  }, [autoFetch, fetchNews])

  return {
    news,
    loading,
    error,
    fetchNews,
    refetch: fetchNews,
  }
}
