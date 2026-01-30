'use client'

import React from 'react'
import Image from 'next/image'
import { ADMIN_CONFIG } from '@/lib/admin-config'

interface AvatarProps {
  username?: string
  avatar?: string
  avatarImage?: string | null
  size?: 'small' | 'medium' | 'large'
  hasBorder?: boolean
}

const sizeMap = {
  small: 32,
  medium: 40,
  large: 80,
}

export default function TwitterAvatar({
  username,
  avatar,
  avatarImage,
  size = 'medium',
  hasBorder = false,
}: AvatarProps) {
  const avatarSize = sizeMap[size]
  
  // Admin or explicit avatar image: use image
  if (avatar === 'admin' || avatarImage) {
    const avatarSrc = avatar === 'admin' ? ADMIN_CONFIG.profilePicture : (avatarImage as string)

    return (
      <div className="shrink-0">
        <Image
          alt={`${username || 'User'} profile image`}
          src={avatarSrc}
          width={avatarSize}
          height={avatarSize}
          className={`
            bg-white/10
            rounded-full
            object-cover
            ${size === 'large' ? 'max-h-[80px]' : size === 'medium' ? 'max-h-[40px]' : 'max-h-[32px]'}
            ${hasBorder ? 'border-neutral-900 border-4 rounded-full' : ''}
          `}
          unoptimized
          onError={(e) => {
            // Fallback to default user avatar on error
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-user.jpg'
          }}
        />
      </div>
    )
  }

  // User avatar generator: colored circle with initials based on username
  const name = username || 'Guest'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'G'

  // Simple hash to pick a background color
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ec4899', // pink
    '#f97316', // orange
    '#8b5cf6', // violet
    '#22c55e', // green
  ]
  const bg = colors[Math.abs(hash) % colors.length]

  const sizeClass =
    size === 'large' ? 'w-20 h-20 text-2xl' : size === 'medium' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'

  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-semibold text-white ${sizeClass} ${
        hasBorder ? 'border-neutral-900 border-4' : ''
      }`}
      style={{ backgroundColor: bg }}
      aria-label={`${name} avatar`}
    >
      {initials}
    </div>
  )
}
