'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

interface DynamicTimestampProps {
  date: Date | string
  className?: string
}

export function DynamicTimestamp({ date, className }: DynamicTimestampProps) {
  const [displayTime, setDisplayTime] = useState(() => formatDate(date))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const elapsed = now.getTime() - dateObj.getTime()

    // Only update dynamically if less than 1 hour ago
    if (elapsed < 60 * 60 * 1000) {
      // Update immediately
      setDisplayTime(formatDate(date))

      // Then update every second for the first minute
      if (elapsed < 60 * 1000) {
        const interval = setInterval(() => {
          setDisplayTime(formatDate(date))
        }, 1000)

        return () => clearInterval(interval)
      }

      // Then update every minute for the first hour
      const interval = setInterval(() => {
        setDisplayTime(formatDate(date))
      }, 60 * 1000)

      return () => clearInterval(interval)
    } else {
      // For older posts, just set once
      setDisplayTime(formatDate(date))
    }
  }, [date, mounted])

  return <span className={className}>{displayTime}</span>
}
