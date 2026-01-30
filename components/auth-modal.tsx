'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  actionName?: string
  /** If provided, overrides the redirect target after successful auth */
  redirectTo?: string
}

export function AuthModal({
  isOpen,
  onClose,
  actionName = 'do this action',
  redirectTo,
}: AuthModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const computedRedirectTo = useMemo(() => {
    if (redirectTo) return redirectTo
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, redirectTo, searchParams])

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
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
            {...modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Login required</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                You need to sign in to{' '}
                <span className="text-emerald-400 font-medium">{actionName}</span>.
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg"
                onClick={() => {
                  onClose()
                  router.push(`/sign-in?redirect=${encodeURIComponent(computedRedirectTo)}`)
                }}
              >
                Sign in
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/20 hover:bg-white/5 font-bold rounded-lg"
                onClick={() => {
                  onClose()
                  router.push(`/sign-up?redirect=${encodeURIComponent(computedRedirectTo)}`)
                }}
              >
                Sign up
              </Button>
            </div>

            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300/80 text-center">
                Demo: your account is stored locally in the browser.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
