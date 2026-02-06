import { useState, useEffect } from 'react'

interface Coordinates {
  latitude: number
  longitude: number
}

interface GeolocationState {
  coords: Coordinates | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }))
      return
    }

    // Request position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (error) => {
        console.log('[v0] Geolocation error:', error.message)
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 3600000, // Cache for 1 hour
      }
    )
  }, [])

  return state
}
