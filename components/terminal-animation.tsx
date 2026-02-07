"use client"

import { useEffect, useState, useRef, useCallback } from "react"

const terminalLines = [
  { type: "command", text: "$ whoami" },
  { type: "output", text: "YOUNES SEDKI - Full-Stack Developer" },
  { type: "command", text: "$ cat skills.txt" },
  { type: "output", text: "→ React, Next.js" },
  { type: "output", text: "→ Node.js, Python" },
  { type: "output", text: "→ Linux, MongoDB" },
  { type: "command", text: "$ ./deploy.sh --production" },
  { type: "output", text: "[✓] Building application..." },
  { type: "output", text: "[✓] Running security checks..." },
  { type: "output", text: "[✓] Deploying to server..." },
  { type: "success", text: "Deployment successful!" },
  { type: "command", text: "$ git status" },
  { type: "output", text: "On branch main" },
  { type: "output", text: "Your branch is up to date" },
  { type: "command", text: "$ systemctl status nginx" },
  { type: "success", text: "● nginx.service - active (running)" },
]

export default function TerminalAnimation() {
  const [mounted, setMounted] = useState(false)
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [currentText, setCurrentText] = useState<string>("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const animateStep = useCallback(() => {
    if (visibleLines >= terminalLines.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleLines(0)
        setCurrentText("")
      }, 3000)
      return
    }

    const currentLine = terminalLines[visibleLines]

    if (currentLine.type === "command") {
      if (currentText.length < currentLine.text.length) {
        timeoutRef.current = setTimeout(() => {
          setCurrentText(currentLine.text.slice(0, currentText.length + 1))
        }, 60)
      } else {
        timeoutRef.current = setTimeout(() => {
          setVisibleLines((prev) => prev + 1)
          setCurrentText("")
        }, 400)
      }
    } else {
      timeoutRef.current = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
        setCurrentText("")
      }, 150)
    }
  }, [visibleLines, currentText])

  useEffect(() => {
    if (!mounted) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    animateStep()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [mounted, animateStep])

  return (
    <div className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/80 font-mono text-sm shadow-2xl backdrop-blur-sm" style={{ touchAction: 'pan-y' }}>
      {/* Terminal header - fixed */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-neutral-800/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-xs text-white/50">younes@dev ~ terminal</span>
      </div>

      {/* Terminal content - no scroll, content fits */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="space-y-1">
          {/* Completed lines */}
          {terminalLines.slice(0, visibleLines).map((line, index) => (
            <div
              key={index}
              className={`${
                line.type === "command"
                  ? "text-emerald-400"
                  : line.type === "success"
                    ? "text-green-400"
                    : "text-white/70"
              }`}
            >
              {line.text}
            </div>
          ))}

          {/* Currently typing line */}
          {mounted && visibleLines < terminalLines.length && terminalLines[visibleLines].type === "command" && (
            <div className="text-emerald-400">
              {currentText}
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            </div>
          )}

          {/* Cursor when showing output */}
          {mounted && visibleLines < terminalLines.length && terminalLines[visibleLines].type !== "command" && (
            <div className="text-emerald-400">
              <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            </div>
          )}
        </div>
      </div>

      {/* Terminal footer - fixed */}
      <div className="shrink-0 border-t border-white/10 bg-neutral-800/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>zsh</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            connected
          </span>
        </div>
      </div>
    </div>
  )
}
