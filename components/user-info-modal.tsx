'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateUsername, validateEmailDomain, sanitizeInput } from '@/lib/validation'

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (username: string, email: string) => void
}


export function UserInfoModal({ isOpen, onClose, onSave }: UserInfoModalProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({})
  const [loading, setLoading] = useState(false)

  const formatUsername = (value: string): string => {
    // Remove @ if user types it, we'll add it automatically
    const cleaned = sanitizeInput(value.replace(/^@+/, '').trim())
    // Only allow alphanumeric and underscore (enforced by validation)
    return cleaned.replace(/[^a-zA-Z0-9_]/g, '')
  }

  const validateForm = () => {
    const newErrors: { username?: string; email?: string } = {}

    // Validate username using validation library
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.error
    }

    // Validate email using validation library
    const emailValidation = validateEmailDomain(email)
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Sanitize inputs
      const sanitizedUsername = sanitizeInput(username)
      const sanitizedEmail = sanitizeInput(email.trim())
      
      // Auto-add @ to username
      const formattedUsername = sanitizedUsername.startsWith('@') 
        ? sanitizedUsername 
        : `@${sanitizedUsername}`
      
      onSave(formattedUsername, sanitizedEmail)
      setUsername('')
      setEmail('')
      setErrors({})
      onClose()
    } catch (err) {
      setErrors({ email: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setUsername('')
    setEmail('')
    setErrors({})
    onClose()
  }

  const backdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const modal = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', duration: 0.4, bounce: 0.3 }
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            {...backdrop}
            onClick={handleClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
            {...modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Set up your profile
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Enter your username and email to start tweeting. We'll automatically add @ to your username.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-white/80">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      const formatted = formatUsername(e.target.value)
                      setUsername(formatted)
                      if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
                    }}
                    className="w-full pl-8 rounded-lg border border-white/20 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="yourusername"
                    disabled={loading}
                    maxLength={15}
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                <p className="text-xs text-white/50 mt-1">
                  Will be saved as @{username || 'yourusername'}
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  className="w-full rounded-lg border border-white/20 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="you@outlook.com"
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                <p className="text-xs text-white/50 mt-1">
                  Only {ALLOWED_EMAIL_DOMAINS.join(', ')} emails are accepted
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 
                          rounded-lg font-bold py-2 mt-6 transition-colors"
              >
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
