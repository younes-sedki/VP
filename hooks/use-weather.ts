'use client'

import { useState, useEffect } from 'react'

interface WeatherState {
  temp: number | null
  icon: string
  city: string
  loading: boolean
}

export function useWeather(
  latitude: number | null,
  longitude: number | null
): WeatherState {
  const [state, setState] = useState<WeatherState>({
    temp: null,
    icon: '',
    city: '',
    loading: true,
  })

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        )
        if (!res.ok) throw new Error('Weather fetch failed')
        const data = await res.json()

        const code = data.current_weather?.weathercode ?? 0
        const temperature = Math.round(data.current_weather?.temperature ?? 0)

        setState({
          temp: temperature,
          icon: weatherCodeToEmoji(code),
          city: '',
          loading: false,
        })
      } catch {
        setState({ temp: null, icon: '', city: '', loading: false })
      }
    }

    fetchWeather()
  }, [latitude, longitude])

  return state
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}
