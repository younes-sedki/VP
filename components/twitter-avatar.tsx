'use client'

import React from 'react'
import Image from 'next/image'

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
  
  // Determine avatar source
  let avatarSrc = '/apple-touch-icon.png' // default
  if (avatarImage) {
    avatarSrc = avatarImage
  } else if (avatar === 'admin') {
    avatarSrc = '/apple-touch-icon.png'
  }

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
          // Fallback to default avatar on error
          const target = e.target as HTMLImageElement
          target.src = '/twitter-user-avatar.jpg'
        }}
      />
    </div>
  )
}
