"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { DotGrid } from "@paper-design/shaders-react"
import { ErrorBoundary } from "@/components/error-boundary"

type DotGridShaderProps = React.ComponentProps<typeof DotGrid>

// Detect if running as PWA/standalone app
function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check iOS standalone mode
  const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true
  
  // Check display-mode for Android PWA and other browsers
  const isDisplayModeStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches
  
  return isIOSStandalone || isDisplayModeStandalone
}

// Detect iOS browser (not PWA - PWA has better WebGL support)
function isIOSBrowser(): boolean {
  if (typeof window === 'undefined') return false
  
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
  
  // If iOS but running as PWA, WebGL works fine
  if (isIOS && isStandaloneMode()) return false
  
  return isIOS
}

// Detect mobile/tablet devices
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // iOS browser crashes on zoom - always disable WebGL
  if (isIOSBrowser()) return true
  
  // Check for touch capability + small screen (more reliable than user agent)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth < 1024
  
  // Also check user agent for tablets that might have larger screens
  const mobileRegex = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i
  const isMobileUA = mobileRegex.test(navigator.userAgent)
  
  return (hasTouch && isSmallScreen) || isMobileUA
}

// Simple debounce function
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }) as T
}

function DotGridShaderInner(props: DotGridShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Start disabled to prevent any WebGL render before mobile check
  const [disabled, setDisabled] = useState(true)
  const [isMobile, setIsMobile] = useState(true)

  // Check if mobile on mount - disable WebGL entirely on mobile to prevent crashes
  useEffect(() => {
    const mobile = isMobileDevice()
    setIsMobile(mobile)
    // Only enable WebGL on non-mobile after check
    if (!mobile) {
      setDisabled(false)
    }
  }, [])

  // Debounced check function for desktop only
  const checkSize = useCallback(
    debounce(() => {
      if (isMobile) return // Skip checks on mobile, already disabled
      
      const el = containerRef.current
      if (!el) return

      const dpr = window.devicePixelRatio || 1
      const w = el.offsetWidth * dpr
      const h = el.offsetHeight * dpr

      // Disable if dimension exceeds safe WebGL texture size
      // Use 4096 as safer limit for compatibility
      if (w > 4096 || h > 4096 || dpr > 2) {
        setDisabled(true)
      } else {
        setDisabled(false)
      }
    }, 250), // 250ms debounce
    [isMobile]
  )

  useEffect(() => {
    if (isMobile) return // Skip resize listener on mobile
    
    checkSize()
    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [checkSize, isMobile])

  // Listen for WebGL context lost
  useEffect(() => {
    if (isMobile) return // Skip on mobile
    
    const el = containerRef.current
    if (!el) return

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      setDisabled(true)
    }

    el.addEventListener("webglcontextlost", handleContextLost, true)
    return () =>
      el.removeEventListener("webglcontextlost", handleContextLost, true)
  }, [isMobile])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        touchAction: "pan-y",
        pointerEvents: "none",
      }}
    >
      {!disabled && (
        <DotGrid
          colorFill="#3a3a3a"
          colorStroke="#000000"
          colorBack="#000000"
          size={1.3}
          gapY={10}
          gapX={10}
          strokeWidth={0.5}
          sizeRange={0.1}
          opacityRange={0.5}
          shape="circle"
          {...props}
          style={{
            backgroundColor: "#000000",
            width: "100%",
            height: "100%",
            ...(props?.style || {}),
          }}
        />
      )}
    </div>
  )
}

export default function DotGridShader(props: DotGridShaderProps) {
  return (
    <ErrorBoundary
      fallback={
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
          }}
        />
      }
    >
      <DotGridShaderInner {...props} />
    </ErrorBoundary>
  )
}
