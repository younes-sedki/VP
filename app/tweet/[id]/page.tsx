'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import TwitterPostFeed from '@/components/twitter-post-feed'

type TweetFromApi = {
  id: string
  author: string
  handle: string
  avatar: string
  avatarImage?: string | null
  content: string
  image?: string | null // For backward compatibility
  images?: string[] | null // New: array of images
  created_at: string
  likes: number
  edited?: boolean
  updatedAt?: string
}

export default function TweetDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [tweet, setTweet] = useState<TweetFromApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTweet = async () => {
      if (!params.id) {
        setError('Invalid tweet ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch all tweets and find the one with matching ID
        const response = await fetch('/api/tweets')
        if (!response.ok) {
          throw new Error('Failed to fetch tweets')
        }
        
        const data = await response.json()
        if (data.tweets && Array.isArray(data.tweets)) {
          const allTweets = data.tweets as TweetFromApi[]
          const foundTweet = allTweets.find(
            (t) => t.id === params.id && t.avatar === 'admin'
          )
          
          if (foundTweet) {
            setTweet(foundTweet)
          } else {
            setError('Tweet not found')
          }
        } else {
          setError('Tweet not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tweet')
      } finally {
        setLoading(false)
      }
    }
    
    loadTweet()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-white/60 text-sm">Loading tweet…</p>
      </main>
    )
  }

  if (error || !tweet) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-semibold">This tweet isn&apos;t available.</p>
          <p className="text-sm text-white/60">{error ?? 'It may have been deleted.'}</p>
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 bg-neutral-950/80 backdrop-blur-sm z-10">
        <button
          onClick={() => router.push('/blog')}
          className="rounded-full p-2 hover:bg-white/10 transition-colors"
          aria-label="Back to blog"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Post</h1>
      </header>

      <section className="max-w-2xl mx-auto border-x border-white/10 min-h-[60vh]">
        <TwitterPostFeed data={tweet} isDetailPage={true} />
      </section>
    </main>
  )
}
