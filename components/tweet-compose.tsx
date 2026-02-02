'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { Send } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TWEET_CONFIG } from '@/lib/config'

interface TweetComposeProps {
  userName: string
  userHandle: string
  userAvatar?: string
  onTweet: (content: string) => Promise<void>
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  onFocus?: () => void
}

export const TweetCompose = forwardRef<HTMLTextAreaElement, TweetComposeProps>(function TweetCompose({
  userName,
  userHandle,
  userAvatar,
  onTweet,
  placeholder = "What's happening!?",
  maxLength = TWEET_CONFIG.MAX_LENGTH,
  disabled = false,
  onFocus
}, ref) {
  const [content, setContent] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

  // Expose textarea ref to parent
  useImperativeHandle(ref, () => textareaRef!, [textareaRef])

  const characterCount = content.length
  const isOverLimit = characterCount > maxLength
  const remainingCharacters = maxLength - characterCount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    if (isOverLimit) return
    if (isComposing) return

    setIsComposing(true)
    setError(null)

    try {
      await onTweet(content)
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post tweet')
    } finally {
      setIsComposing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <div className={cn(
      "border-b border-black/10 dark:border-white/10",
      "bg-white/5 dark:bg-black/90",
      "bg-linear-to-br from-black/5 to-black/[0.02] dark:from-white/5 dark:to-white/[0.02]",
      "backdrop-blur-xl backdrop-saturate-[180%]",
      "shadow-xs dark:shadow-[0_8px_16px_rgb(0_0_0_/_0.15)]"
    )}>
      <div className={cn(
        "px-4 py-4",
        "hover:bg-white/[8%] dark:hover:bg-white/[5%]",
        "transition-all duration-300 backdrop-blur-sm"
      )}>
        <form onSubmit={handleSubmit}>
          {/* User info */}
          <div className="flex gap-4">
            {userAvatar && (
              <Image
                src={userAvatar}
                alt={userName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              {/* Text area */}
              <div className="relative">
                <textarea
                  ref={(el) => {
                    setTextareaRef(el)
                    if (ref) {
                      if (typeof ref === 'function') {
                        ref(el)
                      } else {
                        ref.current = el
                      }
                    }
                  }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={onFocus}
                  placeholder={placeholder}
                  disabled={disabled || isComposing}
                  className={cn(
                    'w-full text-xl placeholder-white/40 text-white/95',
                    'bg-linear-to-br from-black/[0.05] to-transparent dark:from-white/[0.08] dark:to-transparent',
                    'backdrop-blur-md backdrop-saturate-150',
                    'border border-black/[0.05] dark:border-white/[0.08]',
                    'rounded-xl px-4 py-3',
                    'outline-none resize-none',
                    'min-h-[100px] leading-relaxed',
                    'shadow-xs',
                    'focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20',
                    'transition-all duration-300 ease-out',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  maxLength={maxLength * 1.2} // Allow typing over for UX
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              {/* Character counter and action buttons */}
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                  {characterCount > 0 && (
                    <div className={cn(
                      'text-sm font-medium transition-colors',
                      isOverLimit
                        ? 'text-red-500'
                        : characterCount > maxLength * 0.8
                          ? 'text-amber-400'
                          : 'text-white/60'
                    )}>
                      {remainingCharacters}
                    </div>
                  )}
                  {characterCount > 0 && maxLength > 0 && (
                    <div className="w-6 h-6 rounded-full border-2 border-current relative">
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full',
                          isOverLimit ? 'bg-red-500/20' : 'bg-emerald-500/20'
                        )}
                        style={{
                          clipPath: `polygon(0 0, ${(characterCount / maxLength) * 100}% 0, ${(characterCount / maxLength) * 100}% 100%, 0 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!content.trim() || isOverLimit || disabled || isComposing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-full 
                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                            shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50
                            transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {isComposing ? 'Posting...' : 'Post'}
                  {!isComposing && <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
})
