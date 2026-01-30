'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTweets } from '@/hooks/use-tweets'

const STORAGE_KEY = 'tweetUserInfo'

function generateUsername(displayName: string): string {
  // Convert to lowercase, remove special chars, replace spaces with underscores
  let base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 15) // Max 15 chars for base, leaving room for numbers

  if (!base) base = 'user'
  return base
}

function checkUsernameExists(username: string, allTweets: any[]): boolean {
  return allTweets.some(tweet => {
    const handle = tweet.handle?.toLowerCase().replace(/^@/, '')
    return handle === username.toLowerCase()
  })
}

export function ProfileSetupModal() {
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [generatedUsername, setGeneratedUsername] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { tweets, fetchTweets } = useTweets()

  // Check if profile exists in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      setOpen(true)
    }
  }, [])

  // Fetch tweets when modal opens
  useEffect(() => {
    if (open) {
      fetchTweets(100, 0, false).catch(() => {})
    }
  }, [open, fetchTweets])

  // Generate unique username when display name changes
  const generateUniqueUsername = useCallback(async () => {
    if (!displayName.trim()) {
      setGeneratedUsername('')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Fetch all tweets to check existing usernames
      const data = await fetchTweets(100, 0, false)
      const allTweets = (data?.tweets || []) as any[]

      const baseUsername = generateUsername(displayName.trim())
      let candidate = baseUsername
      let counter = 1

      // Check if base username exists
      if (checkUsernameExists(candidate, allTweets)) {
        // Try with numbers until we find a unique one
        while (checkUsernameExists(`${baseUsername}${counter}`, allTweets) && counter < 1000) {
          counter++
        }
        candidate = `${baseUsername}${counter}`
      }

      setGeneratedUsername(candidate)
    } catch (err) {
      setError('Failed to generate username. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }, [displayName, fetchTweets])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayName.trim()) {
        generateUniqueUsername()
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [displayName, generateUniqueUsername])

  const handleSave = () => {
    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    if (!generatedUsername) {
      setError('Please wait for username to generate')
      return
    }

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters')
      return
    }

    if (displayName.trim().length > 50) {
      setError('Display name must be 50 characters or less')
      return
    }

    // Save to localStorage
    const profile = {
      displayName: displayName.trim(),
      username: generatedUsername,
      email: '', // Optional, can be added later
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      setOpen(false)
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profileSaved', { detail: profile }))
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-white/20" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogTitle className="text-xl font-bold text-white">
          Welcome to the blog!
        </DialogTitle>
        <DialogDescription className="text-white/70">
          Enter your display name to get started. We'll automatically create a unique username for you.
        </DialogDescription>

        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-white/80 mb-2">
              Display Name
            </label>
            <Input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setError(null)
              }}
              placeholder="e.g., John Doe"
              className="bg-neutral-800 border-white/15 text-white placeholder:text-white/40"
              autoFocus
              minLength={2}
              maxLength={50}
            />
          </div>

          {generatedUsername && (
            <div className="bg-neutral-800/50 border border-emerald-500/20 rounded-lg p-3">
              <div className="text-xs text-white/50 mb-1">Your username will be:</div>
              <div className="text-sm font-mono text-emerald-300">@{generatedUsername}</div>
              {isGenerating && (
                <div className="text-xs text-white/40 mt-1">Checking availability...</div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={!displayName.trim() || !generatedUsername || isGenerating}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
