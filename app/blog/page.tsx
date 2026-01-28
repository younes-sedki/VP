"use client"

import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Share2, X } from "lucide-react"
import { useState } from "react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"

const initialTweets = [
  {
    id: 1,
    author: "Younes SEDKI",
    handle: "@younes_dev",
    avatar: "👨‍💻",
    content: "Just shipped a new DevOps pipeline that reduced deployment time by 70%. Docker + GitHub Actions is a powerful combo! 🚀",
    timestamp: "2 hours ago",
    likes: 324,
    comments: 45,
    shares: 12,
    liked: false,
  },
  {
    id: 2,
    author: "Younes SEDKI",
    handle: "@younes_dev",
    avatar: "👨‍💻",
    content: "Authentication is hard. Use bcrypt for hashing, JWT for tokens, and never store passwords in plain text. Security first! 🔐",
    timestamp: "5 hours ago",
    likes: 892,
    comments: 127,
    shares: 234,
    liked: false,
  },
  {
    id: 3,
    author: "Younes SEDKI",
    handle: "@younes_dev",
    avatar: "👨‍💻",
    content: "WebSockets + Node.js = real-time magic ✨ Building live features has never been easier. Socket.io is a game-changer!",
    timestamp: "1 day ago",
    likes: 645,
    comments: 78,
    shares: 98,
    liked: false,
  },
]

export default function BlogPage() {
  const [tweets, setTweets] = useState(initialTweets)
  const [newTweet, setNewTweet] = useState("")
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [tweetComments, setTweetComments] = useState<Record<number, { author: string; content: string }[]>>({
    1: [
      { author: "Developer", content: "This is amazing! How did you achieve that performance gain?" },
      { author: "Tech Lead", content: "Love the DevOps focus. This is the way! 🔥" },
    ],
    2: [
      { author: "Security Expert", content: "Great reminder about bcrypt. Salting is crucial!" },
    ],
    3: [],
  })
  const [commentInput, setCommentInput] = useState<Record<number, string>>({})

  const handlePostTweet = () => {
    if (newTweet.trim()) {
      const tweet = {
        id: tweets.length + 1,
        author: "You",
        handle: "@yourhandle",
        avatar: "👤",
        content: newTweet,
        timestamp: "now",
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
      }
      setTweets([tweet, ...tweets])
      setNewTweet("")
    }
  }

  const toggleLike = (id: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        return {
          ...tweet,
          liked: !tweet.liked,
          likes: tweet.liked ? tweet.likes - 1 : tweet.likes + 1,
        }
      }
      return tweet
    }))
  }

  const toggleComments = (id: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAddComment = (tweetId: number) => {
    const comment = commentInput[tweetId]?.trim()
    if (comment) {
      setTweetComments(prev => ({
        ...prev,
        [tweetId]: [
          ...(prev[tweetId] || []),
          { author: "You", content: comment },
        ],
      }))
      setCommentInput(prev => ({
        ...prev,
        [tweetId]: "",
      }))
    }
  }

  return (
    <main className="bg-neutral-950 text-white min-h-screen" id="main-content">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <section className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur" aria-label="Blog header">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Blog Feed</h1>
          </div>
        </div>
      </section>

      {/* Main feed */}
      <div className="mx-auto max-w-2xl">
        {/* Compose tweet */}
        <div className="border-b border-white/10 p-4">
          <RevealOnView as="div" intensity="medium">
            <div className="flex gap-4">
              <div className="text-2xl">👤</div>
              <div className="flex-1">
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-xl outline-none placeholder-white/50 resize-none"
                  rows={3}
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handlePostTweet}
                    disabled={!newTweet.trim()}
                    className="rounded-full bg-emerald-600 px-6 font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>

        {/* Tweets feed */}
        {tweets.map((tweet) => (
          <RevealOnView key={tweet.id} as="div" intensity="medium">
            <article className="border-b border-white/10 p-4 transition-colors hover:bg-white/5">
              {/* Tweet header */}
              <div className="flex gap-4">
                <div className="text-2xl">{tweet.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tweet.author}</span>
                    <span className="text-white/60">{tweet.handle}</span>
                    <span className="text-white/60">·</span>
                    <span className="text-white/60">{tweet.timestamp}</span>
                  </div>

                  {/* Tweet content */}
                  <p className="mt-2 text-base leading-normal text-white">{tweet.content}</p>

                  {/* Tweet actions */}
                  <div className="mt-3 flex max-w-md justify-between text-white/60">
                    <button className="group flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-blue-500/10 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs group-hover:block hidden">{tweet.comments}</span>
                    </button>
                    <button
                      onClick={() => toggleLike(tweet.id)}
                      className={`group flex items-center gap-2 rounded-full px-3 py-2 transition ${
                        tweet.liked
                          ? "text-red-500"
                          : "text-white/60 hover:bg-red-500/10 hover:text-red-500"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${tweet.liked ? "fill-current" : ""}`} />
                      <span className="text-xs">{tweet.likes}</span>
                    </button>
                    <button className="group flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-green-500/10 hover:text-green-500">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">{tweet.shares}</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  {tweet.comments > 0 || Object.keys(tweetComments[tweet.id] || {}).length > 0 ? (
                    <button
                      onClick={() => toggleComments(tweet.id)}
                      className="mt-3 text-sm text-emerald-500 hover:text-emerald-400 font-medium"
                    >
                      {expandedComments[tweet.id] ? "Hide" : "Show"} {Object.keys(tweetComments[tweet.id] || {}).length} comment{Object.keys(tweetComments[tweet.id] || {}).length !== 1 ? "s" : ""}
                    </button>
                  ) : null}

                  {expandedComments[tweet.id] && (
                    <div className="mt-4 space-y-3 border-l-2 border-white/10 pl-4">
                      {(tweetComments[tweet.id] || []).map((comment, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="font-semibold text-white/80">{comment.author}</div>
                          <div className="text-white/70 mt-1">{comment.content}</div>
                        </div>
                      ))}

                      {/* Add comment input */}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={commentInput[tweet.id] || ""}
                          onChange={(e) => setCommentInput(prev => ({
                            ...prev,
                            [tweet.id]: e.target.value,
                          }))}
                          placeholder="Add a comment..."
                          className="flex-1 bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 transition"
                        />
                        <Button
                          onClick={() => handleAddComment(tweet.id)}
                          size="sm"
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </RevealOnView>
        ))}

        {tweets.length === 0 && (
          <div className="p-8 text-center text-white/60">
            <p>No posts yet. Be the first to share something! 🚀</p>
          </div>
        )}
      </div>
    </main>
  )
}
