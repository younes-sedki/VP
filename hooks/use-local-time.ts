'use client'

import { useState, useEffect } from 'react'

interface LocalTimeState {
  time: string
  timezone: string
}

export function useLocalTime(): LocalTimeState {
  const [state, setState] = useState<LocalTimeState>({
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setState({
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }

    update()
    const interval = setInterval(update, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [])

  return state
}
