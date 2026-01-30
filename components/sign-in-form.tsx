'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

interface SignInFormProps {
  /** Optional path to redirect to after successful auth */
  redirectTo?: string
}

export function SignInForm({ redirectTo = '/blog' }: SignInFormProps) {
  const router = useRouter()
  const { signup } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{
    displayName?: string
    username?: string
    email?: string
    password?: string
  }>({})
  const [loading, setLoading] = useState(false)

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const validateForm = () => {
    const nextErrors: {
      displayName?: string
      username?: string
      email?: string
      password?: string
    } = {}

    if (!displayName.trim()) {
      nextErrors.displayName = 'Display name is required'
    } else if (displayName.trim().length < 2) {
      nextErrors.displayName = 'Display name must be at least 2 characters'
    }

    if (!username.trim()) {
      nextErrors.username = 'Username is required'
    } else if (username.trim().length < 3) {
      nextErrors.username = 'Username must be at least 3 characters'
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!validateEmail(email.trim())) {
      nextErrors.email = 'Enter a valid email'
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required'
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Demo-only: we don't verify password server-side, but we collect it
      // to mirror the twitter-clone style fields.
      signup(email.trim(), displayName.trim(), username.trim())
      router.push(redirectTo)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-white/10 bg-neutral-900/80 p-6 sm:p-8 shadow-xl">
      <div className="mb-6 text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-white/60">
          Twitter-style signup: display name, @username, email, and password. All data stays in
          your browser for this demo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="displayName" className="block text-sm font-medium text-white/80">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
              if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }))
            }}
            className="w-full rounded-lg border border-white/20 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="Jane Doe"
            disabled={loading}
          />
          {errors.displayName && (
            <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-white/80">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
            }}
            className="w-full rounded-lg border border-white/20 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="@yourhandle"
            disabled={loading}
          />
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
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
            placeholder="you@example.com"
            disabled={loading}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-white/80">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            className="w-full rounded-lg border border-white/20 bg-neutral-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="••••••••"
            disabled={loading}
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait…' : 'Create account'}
        </Button>
      </form>

      <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-center text-[11px] text-blue-200/80">
        Demo only: any email, display name, username and password will work. Data is saved locally
        in your browser.
      </div>
    </div>
  )
}

