'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Tweet {
  id: string
  author: string
  handle: string
  avatar: string
  content: string
  likes: number
  comments: Array<{ author: string; content: string }>
  image?: string
  timestamp?: string
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession) {
      setIsLoggedIn(true)
      loadTweets()
    }
  }, [])

  const loadTweets = async () => {
    try {
      const adminTweets = await fetch('/admin-tweets.json').then(r => r.json())
      const sorted = adminTweets.sort((a: Tweet, b: Tweet) => {
        const dateA = new Date(a.timestamp || 0).getTime()
        const dateB = new Date(b.timestamp || 0).getTime()
        return dateB - dateA
      })
      setTweets(sorted)
    } catch (error) {
      console.error('Error loading tweets:', error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'younes123') {
      localStorage.setItem('adminSession', 'true')
      setIsLoggedIn(true)
      setPassword('')
      loadTweets()
    } else {
      alert('Invalid password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    setIsLoggedIn(false)
    setPassword('')
    setTweets([])
  }

  const updateTweetInFile = async (tweetId: string, likes: number, comments: Array<{ author: string; content: string }>) => {
    try {
      await fetch('/api/tweets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId, likes, comments, isAdmin: true }),
      })
    } catch (error) {
      console.error('Error updating tweet:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-white/60 text-sm mb-6">Access admin dashboard to reply to tweets</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Login
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link href="/blog">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white/70 hover:bg-white/5 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 sticky top-0 bg-neutral-950/95 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 text-sm">Reply to tweets</p>
          </div>
          <div className="flex gap-2">
            <Link href="/blog">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/70 hover:bg-white/5 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="border-white/20 text-white/70 hover:bg-white/5 rounded-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tweets List */}
      <div className="max-w-2xl mx-auto">
        {tweets.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-white/60">No tweets to reply to yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="border-b border-white/10 p-4 hover:bg-white/5 transition">
                {/* Tweet Header */}
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <div className="text-sm font-bold text-emerald-400">{tweet.author[0]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{tweet.author}</div>
                    <div className="text-white/60 text-sm">@{tweet.handle}</div>
                  </div>
                </div>

                {/* Tweet Content */}
                <div className="mb-3 text-white/90">{tweet.content}</div>

                {tweet.image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img src={tweet.image} alt="" className="w-full h-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
