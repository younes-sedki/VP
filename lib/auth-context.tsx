'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AuthUser {
  email: string
  name: string // display name
  username?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (email: string, name: string, username?: string) => void
  signup: (email: string, name: string, username?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start as null on both server and client to avoid hydration mismatch.
  const [user, setUser] = useState<AuthUser | null>(null)

  // Hydrate auth state from localStorage only after the client mounts.
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('authUser')
      if (saved) {
        const parsed: AuthUser = JSON.parse(saved)
        setUser(parsed)
      }
    } catch {
      localStorage.removeItem('authUser')
    }
  }, [])

  const login = (email: string, name: string, username?: string) => {
    const authUser: AuthUser = { email, name, username }
    setUser(authUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(authUser))
    }
  }

  const signup = (email: string, name: string, username?: string) => {
    const authUser: AuthUser = { email, name, username }
    setUser(authUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(authUser))
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
