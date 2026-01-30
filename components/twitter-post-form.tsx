'use client'

import { useState, useEffect, useCallback } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import TwitterAvatar from './twitter-avatar'
import TwitterButton from './twitter-button'
import { showToast } from '@/lib/toast-helpers'
import { validateTweetContent } from '@/lib/validation'

interface TwitterPostFormProps {
  placeholder: string
  isComment?: boolean
  postId?: string
  onSuccess?: () => void
  createTweet?: (content: string, author: string, handle: string, email?: string) => Promise<any>
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
  createTweet,
}: TwitterPostFormProps) {
  const [percentage, setPercentage] = useState(0)
  const [body, setBody] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [profile, setProfile] = useState<{ displayName: string; username: string; email: string }>({
    displayName: '',
    username: '',
    email: '',
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileEditing, setProfileEditing] = useState(false)
  const [canEditProfile, setCanEditProfile] = useState(true)

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
    const loadProfile = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('tweetUserInfo')
          if (saved) {
            const parsed = JSON.parse(saved)
            setProfile({
              displayName: parsed.displayName || parsed.username || 'Guest',
              username: parsed.username || 'guest',
              email: parsed.email || '',
            })
            setProfileEditing(false)
            setCanEditProfile(false)
          } else {
            setProfileEditing(true)
          }
        } catch {
          setProfileEditing(true)
        }
      }
      setProfileLoaded(true)
    }

    loadProfile()

    // Listen for profile saved event from ProfileSetupModal
    const handleProfileSaved = (e: CustomEvent) => {
      if (e.detail) {
        setProfile({
          displayName: e.detail.displayName || e.detail.username || 'Guest',
          username: e.detail.username || 'guest',
          email: e.detail.email || '',
        })
        setProfileEditing(false)
        setCanEditProfile(false)
      }
    }

    window.addEventListener('profileSaved', handleProfileSaved as EventListener)
    return () => {
      window.removeEventListener('profileSaved', handleProfileSaved as EventListener)
    }
  }, [])

  useEffect(() => {
    const calculatePercentage = () => {
      const currentLength = body.length
      const calculatedPercentage = (currentLength / maxLength) * 100
      setPercentage(calculatedPercentage)
    }
    calculatePercentage()
  }, [body, maxLength])

  const saveProfile = useCallback(() => {
    const displayName = profile.displayName.trim()
    const username = profile.username.trim().replace(/^@+/, '')

    if (!displayName || !username) {
      showToast.error('Please enter a name and @username before tweeting.')
      return
    }

    const payload = {
      displayName,
      username,
      email: profile.email.trim(),
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tweetUserInfo', JSON.stringify(payload))
      } catch {}
    }

    setProfile(payload)
    setProfileEditing(false)
    setCanEditProfile(false)
    showToast.success('Profile saved. You can now tweet.')
  }, [profile])

  const handleSubmit = useCallback(async () => {
    if (!body.trim()) return
    if (body.length > maxLength) return
    if (loading) return

    // Require profile before first tweet
    if (!profile.displayName.trim() || !profile.username.trim()) {
      showToast.error('Set your name and @username before tweeting.')
      setProfileEditing(true)
      return
    }

    // Validate content
    const validation = validateTweetContent(body)
    if (!validation.valid) {
      showToast.error(validation.error || 'Invalid tweet content')
      return
    }

    setLoading(true)

    try {
      const author = profile.displayName.trim()
      const handle = profile.username.trim().replace(/^@+/, '') || 'guest'
      const email = profile.email.trim()

      if (!createTweet) {
        showToast.error('Tweeting is not available right now.')
        return
      }

      await createTweet(body, author, handle, email)
      showToast.success(isComment ? 'Reply posted!' : 'Post created!')
      setBody('')
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      showToast.error(error?.message || 'Something went wrong!')
    } finally {
      setLoading(false)
    }
  }, [body, isComment, createTweet, onSuccess, loading, maxLength, profile])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex items-start px-3 py-3 gap-3 border-b border-white/10">
      <div className="self-start mt-1">
        <TwitterAvatar
          username={profile.username || 'guest'}
          avatar="user"
          avatarImage={undefined}
          size="small"
        />
      </div>
      <div className="w-full space-y-4">
        {profileLoaded && (
          <div className="flex items-center justify-between gap-2 text-xs text-white/60">
            {profileEditing ? (
              <span>Set your name for your first tweet.</span>
            ) : (
              <span>
                Posting as <span className="font-semibold text-white">{profile.displayName || 'Guest'}</span>{' '}
                <span className="text-white/50">@{profile.username || 'guest'}</span>
              </span>
            )}
            {canEditProfile && (
              <button
                type="button"
                onClick={() => setProfileEditing((v) => !v)}
                className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
              >
                {profileEditing ? 'Cancel' : 'Change'}
              </button>
            )}
          </div>
        )}

        {profileEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              className="bg-neutral-900 border border-white/15 rounded-md px-2 py-1 text-white placeholder:text-white/40"
              placeholder="Display name"
              value={profile.displayName}
              onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
            />
            <input
              className="bg-neutral-900 border border-white/15 rounded-md px-2 py-1 text-white placeholder:text-white/40"
              placeholder="@username"
              value={profile.username}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
            />
            <input
              className="bg-neutral-900 border border-white/15 rounded-md px-2 py-1 text-white placeholder:text-white/40"
              placeholder="Email (optional)"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
            <div className="sm:col-span-3 flex justify-end mt-1">
              <TwitterButton
                label="Save profile"
                onClick={saveProfile}
                disabled={loading}
                labelSize="xs"
                labelWeight="medium"
              />
            </div>
          </div>
        )}

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
