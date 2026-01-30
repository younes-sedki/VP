'use client'

import { useEffect, useCallback } from 'react'
import { KEYBOARD_SHORTCUTS } from '@/lib/config'

interface KeyboardShortcutsOptions {
  onCompose?: () => void
  onNavigateDown?: () => void
  onNavigateUp?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onCompose,
  onNavigateDown,
  onNavigateUp,
  onEscape,
  enabled = true,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in inputs/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === KEYBOARD_SHORTCUTS.COMPOSE && onCompose) {
        e.preventDefault()
        onCompose()
      } else if (e.key === KEYBOARD_SHORTCUTS.NAVIGATE_DOWN && onNavigateDown) {
        e.preventDefault()
        onNavigateDown()
      } else if (e.key === KEYBOARD_SHORTCUTS.NAVIGATE_UP && onNavigateUp) {
        e.preventDefault()
        onNavigateUp()
      } else if (e.key === KEYBOARD_SHORTCUTS.ESCAPE && onEscape) {
        e.preventDefault()
        onEscape()
      }
    },
    [enabled, onCompose, onNavigateDown, onNavigateUp, onEscape]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
