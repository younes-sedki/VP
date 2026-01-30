'use client'

import { useState, useEffect, useCallback } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import TwitterAvatar from './twitter-avatar'
import TwitterButton from './twitter-button'
import { useTweets } from '@/hooks/use-tweets'
import { showToast } from '@/lib/toast-helpers'
import { validateTweetContent } from '@/lib/validation'

interface TwitterPostFormProps {
  placeholder: string
  isComment?: boolean
  postId?: string
  onSuccess?: () => void
  currentUser?: {
    username?: string
    name?: string
    avatar?: string
    avatarImage?: string | null
  }
}

export default function TwitterPostForm({
  placeholder,
  isComment = false,
  postId,
  onSuccess,
  currentUser,
}: TwitterPostFormProps) {
  const { createTweet } = useTweets()
  const [percentage, setPercentage] = useState(0)
  const [body, setBody] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const maxLength = 150

  const getProgressbarStyle = () => {
    if (body.length > 0 && body.length < 80) {
      return buildStyles({
        rotation: 0,
        strokeLinecap: 'butt',
        pathTransitionDuration: 0,
        trailColor: 'rgba(255, 255, 255, 0.1)',
        pathColor: '#10b981', // emerald-500
      })
    }
    if (body.length >= 80 && body.length < 100) {
      return buildStyles({
        rotation: 0,
        strokeLinecap: 'butt',
        pathTransitionDuration: 0,
        textSize: '40px',
        textColor: 'rgba(255, 255, 255, 0.6)',
        trailColor: 'rgba(255, 255, 255, 0.1)',
        pathColor: '#fbbf24', // amber-400
      })
    }
    if (body.length >= 100) {
      return buildStyles({
        rotation: 0,
        strokeLinecap: 'butt',
        pathTransitionDuration: 0,
        textSize: '40px',
        textColor: '#ef4444', // red-500
        trailColor: 'rgba(255, 255, 255, 0.1)',
        pathColor: '#ef4444',
      })
    }
  }

  useEffect(() => {
    const calculatePercentage = () => {
      const currentLength = body.length
      const calculatedPercentage = (currentLength / maxLength) * 100
      setPercentage(calculatedPercentage)
    }
    calculatePercentage()
  }, [body, maxLength])

  const handleSubmit = useCallback(async () => {
    if (!body.trim()) return
    if (body.length > maxLength) return
    if (loading) return

    // Validate content
    const validation = validateTweetContent(body)
    if (!validation.valid) {
      showToast(validation.error || 'Invalid tweet content', 'error')
      return
    }

    setLoading(true)

    try {
      // Get user info from localStorage or use defaults
      let author = 'Guest'
      let handle = 'guest'
      let email = ''
      
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('tweetUserInfo')
          if (saved) {
            const parsed = JSON.parse(saved)
            author = parsed.displayName || parsed.username || 'Guest'
            handle = parsed.username || 'guest'
            email = parsed.email || ''
          }
        } catch {}
      }

      await createTweet(body, author, handle, email)
      showToast(isComment ? 'Reply posted!' : 'Post created!', 'success')
      setBody('')
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      showToast(error?.message || 'Something went wrong!', 'error')
    } finally {
      setLoading(false)
    }
  }, [body, isComment, createTweet, onSuccess, loading, maxLength])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl text-white font-bold text-center mt-5">
          Welcome to Twitter
        </h1>
        <div className="text-white flex justify-center gap-4 p-5 border-b-[1px] border-white/10">
          <div className="py-2">
            <TwitterButton
              label="Log in"
              onClick={() => {
                // Handle login - you can integrate with your auth system
                showToast('Login functionality not implemented', 'error')
              }}
              labelSize="base"
              labelWeight="semibold"
            />
          </div>
          <div className="py-2">
            <TwitterButton
              label="Sign up"
              onClick={() => {
                // Handle sign up
                showToast('Sign up functionality not implemented', 'error')
              }}
              secondary
              labelSize="base"
              labelWeight="semibold"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center px-3 py-2 gap-3 border-b border-white/10">
      <div className="self-start mt-1">
        <TwitterAvatar
          username={currentUser.username}
          avatar={currentUser.avatar}
          avatarImage={currentUser.avatarImage}
          size="small"
        />
      </div>
      <div className="w-full space-y-6">
        <textarea
          className="w-full resize-none outline-none bg-transparent mt-2 text-base text-white placeholder-white/40 peer scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scrollbar-thumb-rounded-md scrollbar-track-rounded-sm"
          placeholder={placeholder}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength * 1.2} // Allow typing over for UX
          disabled={loading}
          rows={3}
        />
        <hr
          className="opacity-0 peer-focus:opacity-100 h-[1px] transition-opacity border-white/10 w-full"
          style={{
            marginTop: 0,
          }}
        />
        <div
          className="w-full flex justify-end items-center gap-2"
          style={{
            marginTop: 0,
          }}
        >
          <div className="flex items-center cursor-pointer">
            {body.length > 0 && body.length < 80 && body.trim() ? (
              <CircularProgressbar
                className="w-4 h-4 ease-in duration-300"
                value={percentage}
                styles={getProgressbarStyle()}
              />
            ) : body.length >= 80 && body.trim() ? (
              <CircularProgressbar
                className="w-5 h-5 ease-out duration-300"
                value={percentage}
                styles={getProgressbarStyle()}
                text={`${maxLength - body.length}`}
              />
            ) : null}
          </div>
          <TwitterButton
            disabled={loading || !body.trim() || body.length > maxLength}
            label={loading ? 'Posting...' : 'Tweet'}
            onClick={handleSubmit}
            labelSize="sm"
            labelWeight="semibold"
            type="button"
          />
        </div>
      </div>
    </div>
  )
}
