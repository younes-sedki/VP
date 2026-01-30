'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { ADMIN_PROFILE, type ProfileInfo } from '@/lib/profile-config'
import TwitterAvatar from './twitter-avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile?: ProfileInfo
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile = ADMIN_PROFILE,
}: ProfileModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Handle animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 200) // Match transition duration
  }

  if (!mounted || !isOpen) return null

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md mx-4 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-5'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white/60 hover:text-white z-10 bg-black/50 rounded-full p-2 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-transparent p-6 pt-8">
          <div className="flex flex-col items-center text-center">
            <TwitterAvatar
              username={profile.fullName}
              avatarImage={profile.profilePicture}
              size="large"
              hasBorder={false}
            />
            <h2 className="text-2xl font-bold text-white mt-4">{profile.fullName}</h2>
            <p className="text-emerald-400 text-sm font-medium mt-1">{profile.role}</p>
            <p className="text-white/60 text-xs mt-1">Age {profile.age}</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-4">
          {profile.bio && (
            <div>
              <p className="text-white/80 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Contact Links */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/10">
            {profile.linkedin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/70 hover:text-emerald-400 transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10">
                  Visit LinkedIn profile
                </TooltipContent>
              </Tooltip>
            )}
            {profile.github && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/70 hover:text-emerald-400 transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10">
                  Visit GitHub profile
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
