import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number | null
  icon: string | null
  city: string | null
  loading: boolean
  error: string | null
}

const WEATHER_CACHE_KEY = 'weather_cache'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export function useWeather(latitude: number | null, longitude: number | null) {
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    icon: null,
    city: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!latitude || !longitude) {
      setWeather((prev) => ({
        ...prev,
        loading: false,
      }))
      return
    }

    const fetchWeather = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(WEATHER_CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            setWeather({
              temp: data.temp,
              icon: data.icon,
              city: data.city,
              loading: false,
              error: null,
            })
            return
          }
        }

        // Fetch from Open-Meteo API (no API key required)
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
        )
        const geoData = await geoResponse.json()
        const city =
          geoData.results && geoData.results.length > 0
            ? geoData.results[0].name
            : null

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        )
        const weatherData = await weatherResponse.json()

        const temp = Math.round(weatherData.current.temperature_2m)
        const weatherCode = weatherData.current.weather_code
        const icon = getWeatherIcon(weatherCode)

        const cacheData = {
          temp,
          icon,
          city,
          timestamp: Date.now(),
        }
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData))

        setWeather({
          temp,
          icon,
          city,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.log('[v0] Weather fetch error:', error)
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: 'Weather unavailable',
        }))
      }
    }

    fetchWeather()
  }, [latitude, longitude])

  return weather
}

function getWeatherIcon(code: number): string {
  // WMO Weather interpretation codes
  if (code === 0 || code === 1) return '☀️' // Clear/Mainly clear
  if (code === 2) return '⛅' // Partly cloudy
  if (code === 3) return '☁️' // Overcast
  if (code >= 45 && code <= 48) return '🌫️' // Fog
  if (code >= 51 && code <= 67) return '🌧️' // Drizzle/Rain
  if (code >= 71 && code <= 77) return '❄️' // Snow
  if (code >= 80 && code <= 82) return '🌦️' // Rain showers
  if (code === 85 || code === 86) return '🌨️' // Snow showers
  if (code >= 80 && code <= 99) return '⛈️' // Thunderstorm
  return '🌡️' // Default
}
