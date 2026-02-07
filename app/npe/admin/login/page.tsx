"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Bold,
  Italic,
  Code,
  LinkIcon,
  List,
  LogOut,
  ArrowLeft,
  ImagePlus,
  Send,
  FileText,
  FileImage,
  Search,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
} from "lucide-react"
import { RiHeart3Line, RiHeart3Fill } from "react-icons/ri"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichTextContent } from "@/components/rich-text-content"
import { TWEET_CONFIG } from "@/lib/config"
import { ADMIN_CONFIG } from "@/lib/admin-config"

type AdminTweet = {
  id: string
  author: string
  handle: string
  avatar: string
  content: string
  image?: string | null
  created_at: string
}

type UserTweet = {
  id: string
  author: string
  handle: string
  content: string
  created_at: string
  likes?: number
  likedByAdmin?: boolean
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB for images
const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10MB for PDFs
const MAX_GIF_BYTES = 10 * 1024 * 1024 // 10MB for GIFs

function wrapSelection(
  value: string,
  start: number,
  end: number,
  left: string,
  right: string
): { nextValue: string; nextStart: number; nextEnd: number } {
  const selected = value.slice(start, end)
  const nextValue = value.slice(0, start) + left + selected + right + value.slice(end)
  const nextStart = start + left.length
  const nextEnd = end + left.length
  return { nextValue, nextStart, nextEnd }
}

function insertAtLineStart(
  value: string,
  start: number,
  end: number,
  prefix: string
): { nextValue: string; nextStart: number; nextEnd: number } {
  const before = value.slice(0, start)
  const selection = value.slice(start, end)
  const after = value.slice(end)

  const lineStartIndex = before.lastIndexOf('\n') + 1
  const selectionWithPrefix = selection
    ? selection
        .split('\n')
        .map((line) => (line.trim().length ? `${prefix}${line}` : line))
        .join('\n')
    : `${prefix}`

  const nextValue = value.slice(0, lineStartIndex) + selectionWithPrefix + after
  const delta = selectionWithPrefix.length - selection.length
  return {
    nextValue,
    nextStart: start + (start === end ? prefix.length : 0),
    nextEnd: end + delta,
  }
}

export default function AdminLoginPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [fileData, setFileData] = useState<{ url: string; type: 'image' | 'pdf' | 'gif'; name: string } | null>(null)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [tweets, setTweets] = useState<AdminTweet[]>([])
  const [userTweets, setUserTweets] = useState<UserTweet[]>([])
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [likingTweetId, setLikingTweetId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('user')

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const remaining = useMemo(
    () => TWEET_CONFIG.MAX_LENGTH - content.length,
    [content.length]
  )

  // Stats calculations
  const stats = useMemo(() => {
    const totalLikes = userTweets.reduce((sum, t) => sum + ((t as any).likes || 0), 0)
    const adminLikedCount = userTweets.filter((t) => (t as any).likedByAdmin).length
    return {
      totalTweets: tweets.length + userTweets.length,
      adminTweets: tweets.length,
      userTweets: userTweets.length,
      totalLikes,
      adminLikedCount,
    }
  }, [tweets, userTweets])

  // Filtered tweets based on search
  const filteredAdminTweets = useMemo(() => {
    if (!searchQuery.trim()) return tweets
    const q = searchQuery.toLowerCase()
    return tweets.filter((t) =>
      t.content.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      t.handle.toLowerCase().includes(q)
    )
  }, [tweets, searchQuery])

  const filteredUserTweets = useMemo(() => {
    if (!searchQuery.trim()) return userTweets
    const q = searchQuery.toLowerCase()
    return userTweets.filter((t) =>
      t.content.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      t.handle.toLowerCase().includes(q)
    )
  }, [userTweets, searchQuery])

  const fetchAdminTweets = useCallback(async () => {
    const res = await fetch('/api/tweets?limit=50&offset=0', { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    const all = Array.isArray(data?.tweets) ? data.tweets : []
    const adminOnly = all.filter((t: any) => t?.avatar === 'admin') as AdminTweet[]
    const userOnly = all.filter((t: any) => t?.avatar === 'user') as UserTweet[]
    setTweets(adminOnly)
    setUserTweets(userOnly)
  }, [])

  useEffect(() => {
    let isMounted = true
    let intervalId: number | null = null
    
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me', { 
          cache: 'no-store',
          credentials: 'include' // Ensure cookies are sent
        })
        const data = await res.json().catch(() => ({}))
        if (!isMounted) return
        
        const isLoggedIn = Boolean(data?.loggedIn)
        setLoggedIn(isLoggedIn)
        
        // If logged in, verify session is still valid periodically
        if (isLoggedIn && isMounted) {
          // Re-check auth every 5 minutes to catch expired sessions
          intervalId = setInterval(async () => {
            if (!isMounted) {
              if (intervalId) clearInterval(intervalId)
              return
            }
            try {
              const recheckRes = await fetch('/api/admin/me', { 
                cache: 'no-store',
                credentials: 'include'
              })
              const recheckData = await recheckRes.json().catch(() => ({}))
              if (!isMounted) return
              const stillLoggedIn = Boolean(recheckData?.loggedIn)
              if (!stillLoggedIn && isMounted) {
                setLoggedIn(false)
                if (intervalId) {
                  clearInterval(intervalId)
                  intervalId = null
                }
              }
            } catch (err) {
              console.error('Auth recheck failed:', err)
            }
          }, 5 * 60 * 1000) // 5 minutes
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        if (isMounted) {
          setLoggedIn(false)
        }
      } finally {
        if (isMounted) setChecking(false)
      }
    }
    
    checkAuth()
    
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }, [])

  useEffect(() => {
    if (loggedIn) fetchAdminTweets().catch(() => {})
  }, [loggedIn, fetchAdminTweets])

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    const trimmed = password.trim()

    // Basic client-side hardening to avoid obvious bad input
    if (!trimmed || trimmed.length < 8 || trimmed.length > 128) {
      setLoginError('Password must be between 8 and 128 characters.')
      setPassword('')
      return
    }

    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      setLoggedIn(true)
      setPassword('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
      setPassword('')
    } finally {
      setLoginLoading(false)
    }
  }

  const doLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setLoggedIn(false)
    setContent('')
    setImageDataUrl(null)
    setTweets([])
  }

  const applyFormat = (kind: 'bold' | 'italic' | 'code' | 'link' | 'list') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const value = content

    let next: { nextValue: string; nextStart: number; nextEnd: number } | null = null

    if (kind === 'bold') next = wrapSelection(value, start, end, '**', '**')
    if (kind === 'italic') next = wrapSelection(value, start, end, '_', '_')
    if (kind === 'code') next = wrapSelection(value, start, end, '`', '`')
    if (kind === 'link') {
      const selected = value.slice(start, end) || 'text'
      const inserted = `[${selected}](https://)`
      next = {
        nextValue: value.slice(0, start) + inserted + value.slice(end),
        nextStart: start + inserted.indexOf('https://'),
        nextEnd: start + inserted.length - 1, // exclude trailing ')'
      }
    }
    if (kind === 'list') next = insertAtLineStart(value, start, end, '- ')

    if (!next) return
    setContent(next.nextValue)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(next.nextStart, next.nextEnd)
    })
  }

  const onPickFile = async (file: File | null) => {
    setPostError(null)
    if (!file) {
      setImageDataUrl(null)
      setFileData(null)
      return
    }

    // Validate file type
    const isImage = file.type.startsWith('image/') && file.type !== 'image/gif'
    const isGif = file.type === 'image/gif'
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isGif && !isPdf) {
      setPostError('Please choose a valid image (JPG/PNG/WEBP), GIF, or PDF file.')
      return
    }

    // Validate file size
    let maxSize = MAX_IMAGE_BYTES
    if (isPdf) maxSize = MAX_PDF_BYTES
    if (isGif) maxSize = MAX_GIF_BYTES

    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0)
      setPostError(`File is too large. Please keep it under ${maxMB}MB.`)
      return
    }

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (isImage) {
        setImageDataUrl(dataUrl)
        setFileData({ url: dataUrl, type: 'image', name: file.name })
      } else if (isGif) {
        setImageDataUrl(dataUrl) // GIFs can be displayed as images
        setFileData({ url: dataUrl, type: 'gif', name: file.name })
      } else if (isPdf) {
        setImageDataUrl(null) // PDFs don't have image preview
        setFileData({ url: dataUrl, type: 'pdf', name: file.name })
      }
    }
    reader.onerror = () => setPostError('Failed to read file')
    reader.readAsDataURL(file)
  }

  const submitTweet = async () => {
    const trimmed = content.trim()
    if (!trimmed) return
    if (trimmed.length > TWEET_CONFIG.MAX_LENGTH) {
      setPostError(`Tweet must be ${TWEET_CONFIG.MAX_LENGTH} characters or less.`)
      return
    }
    setPosting(true)
    setPostError(null)
    try {
      // Get CSRF token
      const csrfRes = await fetch('/api/csrf-token')
      const { token } = await csrfRes.json()
      
      const res = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify({
          isAdmin: true,
          content: trimmed,
          imageUrl: imageDataUrl || fileData?.url || null,
          fileType: fileData?.type || null,
          fileName: fileData?.name || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to post')
      setContent('')
      setImageDataUrl(null)
      setFileData(null)
      await fetchAdminTweets()
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const submitAdminReply = async (tweetId: string) => {
    const trimmed = replyBody.trim()
    if (!trimmed) return
    setReplyLoading(true)
    setReplyError(null)
    try {
      const res = await fetch('/api/tweets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetId,
          isAdminReply: true,
          commentIndex: null,
          comments: [
            {
              author: ADMIN_CONFIG.name,
              content: trimmed,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to send reply')
      setReplyBody('')
      setReplyingToId(null)
      await fetchAdminTweets()
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send reply')
    } finally {
      setReplyLoading(false)
    }
  }

  const deleteTweet = async (tweetId: string, isAdminTweet: boolean) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Are you sure you want to delete this tweet?')
      if (!ok) return
    }

    setDeleteLoadingId(tweetId)
    setDeleteError(null)

    try {
      const res = await fetch('/api/tweets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetId,
          isAdmin: isAdminTweet,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to delete tweet')

      await fetchAdminTweets()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete tweet')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <div className="text-white/60 text-sm">Checking authentication…</div>
        </div>
      </div>
    )
  }

  // Show login form if not logged in
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-neutral-950/80 border border-emerald-500/20 rounded-2xl p-6 shadow-xl shadow-emerald-500/15 backdrop-blur">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80 mb-2">
                Admin area
              </p>
              <h1 className="text-2xl font-black text-white">Secure login</h1>
              <p className="text-white/60 text-sm mt-1">
                Enter your admin password to access the tweet console.
              </p>
            </div>

            <form onSubmit={doLogin} className="space-y-4" autoComplete="off">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]"
                >
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  className="bg-neutral-900 border-white/15 text-white placeholder:text-white/50 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/70"
                  aria-invalid={Boolean(loginError)}
                  aria-describedby={loginError ? 'admin-password-error' : undefined}
                />
              </div>
              {loginError && (
                <p id="admin-password-error" className="text-red-400 text-xs">
                  {loginError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-full font-semibold shadow-lg bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-60"
                disabled={loginLoading}
              >
                {loginLoading ? 'Verifying…' : 'Login to dashboard'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-white/40">
                Only you should ever see this page.
              </span>
              <Link href="/blog">
                <Button
                  variant="ghost"
                  className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
                >
                  <ArrowLeft className="w-3 h-3 mr-1.5" />
                  Blog
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
      <div className="border-b border-emerald-500/20 sticky top-0 bg-neutral-950/90 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-full bg-emerald-500/20 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <h1 className="text-xl font-bold tracking-tight">Admin console</h1>
            </div>
            <p className="text-white/60 text-xs mt-1">
              Post verified tweets with images and Markdown formatting.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/blog">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Button
              onClick={doLogout}
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Total Posts</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalTweets}</div>
          </div>
          <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">User Posts</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.userTweets}</div>
          </div>
          <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Admin Posts</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{stats.adminTweets}</div>
          </div>
          <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs">Total Likes</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.totalLikes}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="text"
            placeholder="Search posts by content, author, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-900/60 border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Composer */}
        <div className="bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-black border border-emerald-500/25 rounded-2xl p-4 shadow-lg shadow-emerald-500/15">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <span className="inline-flex h-6 px-2 rounded-full bg-emerald-500/15 text-[11px] text-emerald-300 uppercase tracking-[0.18em] items-center">
                Compose
              </span>
              <span className="text-[11px] text-white/50">
                Markdown + image
              </span>
            </div>
            <div
              className={`text-xs px-2 py-0.5 rounded-full border ${
                remaining < 0
                  ? 'text-red-300 border-red-500/40 bg-red-500/10'
                  : remaining < TWEET_CONFIG.MAX_LENGTH * 0.2
                  ? 'text-amber-200 border-amber-400/40 bg-amber-500/10'
                  : 'text-emerald-200 border-emerald-400/30 bg-emerald-500/5'
              }`}
            >
              {remaining}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              onClick={() => applyFormat('bold')}
            >
              <Bold className="w-4 h-4 mr-2" /> Bold
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              onClick={() => applyFormat('italic')}
            >
              <Italic className="w-4 h-4 mr-2" /> Italic
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              onClick={() => applyFormat('code')}
            >
              <Code className="w-4 h-4 mr-2" /> Code
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              onClick={() => applyFormat('link')}
            >
              <LinkIcon className="w-4 h-4 mr-2" /> Link
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              onClick={() => applyFormat('list')}
            >
              <List className="w-4 h-4 mr-2" /> List
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your tweet (Markdown supported)…"
            rows={5}
            maxLength={TWEET_CONFIG.MAX_LENGTH * 1.2}
            className="mb-3 bg-neutral-950/60 border-white/15 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/70 text-sm"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 text-xs text-white/70 cursor-pointer group">
                <span className="h-8 w-8 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-500/5 group-hover:bg-emerald-500/15 transition-colors">
                  <ImagePlus className="w-4 h-4 text-emerald-300" />
                </span>
                <span>Image/GIF/PDF</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                />
              </label>
              {(imageDataUrl || fileData) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">
                    {fileData?.type === 'pdf' && <FileText className="w-3 h-3 inline mr-1" />}
                    {fileData?.type === 'gif' && <FileImage className="w-3 h-3 inline mr-1" />}
                    {fileData?.name || 'File attached'}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
                    onClick={() => {
                      setImageDataUrl(null)
                      setFileData(null)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Button
              type="button"
              className="rounded-full font-semibold h-9 px-5 text-sm"
              disabled={posting || !content.trim() || remaining < 0}
              onClick={submitTweet}
            >
              {posting ? 'Posting…' : 'Post'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {postError && <p className="text-red-400 text-xs mt-3">{postError}</p>}

          {(content.trim() || imageDataUrl || fileData) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/50 mb-2">Preview</div>
              <div className="bg-neutral-950 border border-white/10 rounded-xl p-3">
                <RichTextContent content={content || ' '} />
                {imageDataUrl && fileData?.type !== 'pdf' && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                    <img src={imageDataUrl} alt="Preview" className="w-full h-auto" />
                  </div>
                )}
                {fileData?.type === 'pdf' && (
                  <div className="mt-3 rounded-lg border border-white/10 p-4 bg-neutral-900/50">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FileText className="w-5 h-5" />
                      <span className="text-sm font-medium">{fileData.name}</span>
                      <span className="text-xs text-white/50">(PDF)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'user'
                ? 'bg-blue-500/15 text-blue-400 border-b-2 border-blue-500'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            User Posts ({filteredUserTweets.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'admin'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Admin Posts ({filteredAdminTweets.length})
          </button>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
              onClick={() => fetchAdminTweets()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Admin tweets list */}
        {activeTab === 'admin' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">
              {searchQuery ? `Search results (${filteredAdminTweets.length})` : 'Latest admin tweets'}
            </h2>
          </div>

          {filteredAdminTweets.length === 0 ? (
            <div className="text-white/60 text-sm">{searchQuery ? 'No matching admin tweets.' : 'No admin tweets yet.'}</div>
          ) : (
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 overflow-hidden bg-neutral-950/60">
              {filteredAdminTweets.slice(0, 10).map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-4 ${
                    idx === 0 ? 'bg-emerald-500/5' : 'bg-neutral-900/70'
                  }`}
                >
                  <div className="text-white/80 text-xs mb-1 flex items-center justify-between gap-2">
                    <span className="text-white/70">
                      @{t.handle} · {new Date(t.created_at).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                          Latest
                        </span>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] text-red-300 hover:text-red-200 hover:bg-red-500/10"
                        disabled={deleteLoadingId === t.id}
                        onClick={() => deleteTweet(t.id, true)}
                      >
                        {deleteLoadingId === t.id ? 'Deleting…' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                  <RichTextContent content={t.content} />
                  {t.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                      <img src={t.image} alt="" className="w-full h-auto" />
                    </div>
                  )}
                  {deleteError && (
                    <p className="mt-2 text-[11px] text-red-400">{deleteError}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* User tweets for admin replies */}
        {activeTab === 'user' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">
              {searchQuery ? `Search results (${filteredUserTweets.length})` : 'User tweets'}
            </h2>
          </div>

          {filteredUserTweets.length === 0 ? (
            <div className="text-white/60 text-sm">{searchQuery ? 'No matching user tweets.' : 'No user tweets yet.'}</div>
          ) : (
            <div className="space-y-3">
              {filteredUserTweets.slice(0, 15).map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border ${
                    (t as any).likedByAdmin
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-white/10 bg-neutral-950/70'
                  } space-y-3 transition-all hover:border-white/20`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-white text-sm">{t.author}</span>
                        <span className="text-white/50 text-xs">@{t.handle}</span>
                        {(t as any).likedByAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300">
                            <RiHeart3Fill className="w-2.5 h-2.5" />
                            Admin liked
                          </span>
                        )}
                      </div>
                      <span className="text-white/40 text-xs">
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </div>
                    {(t as any).likes !== undefined && (t as any).likes > 0 && (
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <RiHeart3Line className="w-3.5 h-3.5" />
                        <span>{(t as any).likes}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                    <RichTextContent content={t.content} />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-3 text-xs bg-emerald-500/10 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-500/25"
                        onClick={() =>
                          setReplyingToId((current) => (current === t.id ? null : t.id))
                        }
                      >
                        Reply as admin
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={`rounded-full h-8 px-3 text-xs flex items-center gap-1.5 ${
                          (t as any).likedByAdmin
                            ? 'text-red-400 bg-red-500/10 border border-red-500/40'
                            : 'text-white/60 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                        disabled={likingTweetId === t.id}
                        onClick={async (e) => {
                          e.stopPropagation()
                          setLikingTweetId(t.id)
                          try {
                            const action = (t as any).likedByAdmin ? 'unlike' : 'like'
                            const response = await fetch(`/api/tweets/${t.id}/like`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action }),
                            })
                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({}))
                              throw new Error(errorData.error || 'Failed to like')
                            }
                            const result = await response.json()
                            // Refresh tweets to get updated likedByAdmin status
                            await fetchAdminTweets()
                          } catch (err) {
                            console.error('Error liking tweet:', err)
                            alert(err instanceof Error ? err.message : 'Failed to like tweet')
                          } finally {
                            setLikingTweetId(null)
                          }
                        }}
                      >
                        {(t as any).likedByAdmin ? (
                          <RiHeart3Fill className="w-3.5 h-3.5" />
                        ) : (
                          <RiHeart3Line className="w-3.5 h-3.5" />
                        )}
                        <span>{(t as any).likes || 0}</span>
                      </Button>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="rounded-full h-8 px-3 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10"
                      disabled={deleteLoadingId === t.id}
                      onClick={() => deleteTweet(t.id, false)}
                    >
                      {deleteLoadingId === t.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                  {replyingToId === t.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <div className="w-0.5 h-3 rounded-full bg-emerald-500" />
                        Replying to @{t.handle}
                      </div>
                      <Textarea
                        rows={3}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write your reply..."
                        className="bg-neutral-900/80 border-white/10 text-sm rounded-xl resize-none focus:border-emerald-500/40 focus:ring-0 placeholder:text-white/30"
                      />
                      {replyError && (
                        <p className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">{replyError}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 px-4 text-xs rounded-full text-white/50 hover:text-white hover:bg-white/10"
                          onClick={() => {
                            setReplyingToId(null)
                            setReplyBody('')
                            setReplyError(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 px-5 text-xs rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium"
                          disabled={replyLoading || !replyBody.trim()}
                          onClick={() => submitAdminReply(t.id)}
                        >
                          {replyLoading ? 'Sending…' : 'Send reply'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

