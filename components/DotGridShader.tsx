"use client"

import { useEffect, useRef, useState } from "react"
import { DotGrid } from "@paper-design/shaders-react"
import { ErrorBoundary } from "@/components/error-boundary"

type DotGridShaderProps = React.ComponentProps<typeof DotGrid>

function DotGridShaderInner(props: DotGridShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    // Disable shader if device pixel ratio * container size would exceed
    // common max WebGL texture sizes (e.g. when browser is zoomed in)
    const check = () => {
      const el = containerRef.current
      if (!el) return

      const dpr = window.devicePixelRatio || 1
      const w = el.offsetWidth * dpr
      const h = el.offsetHeight * dpr

      // Most GPUs support at least 4096; many support 8192+.
      // Disable if either dimension would exceed 8192 physical pixels.
      if (w > 8192 || h > 8192) {
        setDisabled(true)
      } else {
        setDisabled(false)
      }
    }

    check()

    // Re-check on resize / zoom changes (zoom triggers resize events)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Listen for WebGL context lost on any canvas inside our container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      setDisabled(true)
    }

    // The shader library creates a canvas; listen on container for bubbled events
    el.addEventListener("webglcontextlost", handleContextLost, true)
    return () =>
      el.removeEventListener("webglcontextlost", handleContextLost, true)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
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
