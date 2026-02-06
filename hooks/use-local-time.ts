import { useState, useEffect } from 'react'

interface TimeData {
  time: string
  timezone: string
  city: string | null
}

export function useLocalTime() {
  const [timeData, setTimeData] = useState<TimeData>({
    time: '',
    timezone: '',
    city: null,
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()

      // Format time HH:MM
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      // Get timezone using Intl API
      const timezone = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short',
      })
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName')?.value || 'UTC'

      setTimeData((prev) => ({
        ...prev,
        time,
        timezone,
      }))
    }

    updateTime()

    // Update every minute
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  return timeData
}
