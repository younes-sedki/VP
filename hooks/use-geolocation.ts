'use client'

import { useState, useEffect } from 'react'

interface Coords {
  latitude: number
  longitude: number
}

interface GeolocationState {
  coords: Coords | null
  loading: boolean
  error: string | null
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, loading: false, error: 'Geolocation not supported' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
        })
      },
      (err) => {
        setState({ coords: null, loading: false, error: err.message })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }, [])

  return state
}
