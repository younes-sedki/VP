'use client'

import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import TwitterPostFeed from '@/components/twitter-post-feed'
import TwitterPostForm from '@/components/twitter-post-form'
import { ProfileSetupModal } from '@/components/profile-setup-modal'
import { useTweets } from '@/hooks/use-tweets'
import { AuthProvider } from '@/lib/auth-context'

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
  comments: Array<{ author: string; content: string; timestamp?: string }>
  retweets?: number
  replies?: number
}

function InnerBlogTweetSection() {
  const { tweets, loading, error, fetchTweets, createTweet } = useTweets()

  useEffect(() => {
    void fetchTweets()
  }, [fetchTweets])

  // Listen for reload event from navbar
  useEffect(() => {
    const handleReload = () => {
      void fetchTweets()
    }
    window.addEventListener('reload-tweets', handleReload)
    return () => window.removeEventListener('reload-tweets', handleReload)
  }, [fetchTweets])

  const typedTweets: TweetFromApi[] = useMemo(() => {
    const allTweets = (tweets as unknown as TweetFromApi[]) ?? []
    return allTweets
  }, [tweets])


  return (
    <>
      <ProfileSetupModal />
      <section
        id="blog-tweets"
        aria-label="Latest tweets"
        className="rounded-3xl border border-white/10 bg-neutral-900/60 overflow-hidden"
      >
        <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Dev log & tweets</h2>
            <p className="text-sm text-white/60">
              Quick thoughts, release notes, and experiments from my development journey.
            </p>
          </div>
        </div>

        {/* Everyone can tweet */}
        <div className="border-b border-white/10 bg-neutral-950/60">
          <TwitterPostForm 
            placeholder="Share something…" 
            createTweet={createTweet}
          />
        </div>

      {error && (
        <div className="px-4 pt-3">
          <div
            className="relative mx-1 rounded-2xl border border-red-500/35 bg-red-500/10 
                       bg-gradient-to-r from-red-500/15 via-red-500/5 to-transparent
                       backdrop-blur-md px-4 py-2.5 text-sm text-red-100
                       shadow-md shadow-red-500/30 flex items-center gap-2"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
            <p className="truncate">{error}</p>
          </div>
        </div>
      )}

      {loading && typedTweets.length === 0 ? (
        <div className="px-4 py-10 text-center text-white/60 text-sm">
          Loading tweets...
        </div>
      ) : typedTweets.length === 0 ? (
        <div className="px-4 py-10 text-center text-white/60 text-sm">
          No tweets yet. Check back soon!
        </div>
      ) : (
        <div>
          <AnimatePresence initial={false}>
            {typedTweets.map((tweet, index) => (
              <motion.div
                key={`${tweet.id}-${tweet.created_at}-${index}`}
                id={`tweet-${tweet.id}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{ transform: 'none' }}
              >
                <TwitterPostFeed
                  data={tweet}
                  currentUser={undefined}
                  onEdit={undefined}
                  onDelete={undefined}
                  onComment={undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
    </>
  )
}

export function BlogTweetSection() {
  return (
    <AuthProvider>
      <InnerBlogTweetSection />
    </AuthProvider>
  )
}

