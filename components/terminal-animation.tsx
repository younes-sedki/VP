"use client"

import { useEffect, useState } from "react"

const terminalLines = [
  { type: "command", text: "$ whoami" },
  { type: "output", text: "younes - full-stack developer" },
  { type: "command", text: "$ cat skills.txt" },
  { type: "output", text: "→ TypeScript, React, Next.js" },
  { type: "output", text: "→ Node.js, Python, Go" },
  { type: "output", text: "→ Docker, Kubernetes, CI/CD" },
  { type: "output", text: "→ Linux, Nginx, PostgreSQL" },
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
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [currentText, setCurrentText] = useState<string>("")
  const [isTyping, setIsTyping] = useState<boolean>(true)

  useEffect(() => {
    if (visibleLines >= terminalLines.length) {
      // Reset after a pause
      const resetTimeout = setTimeout(() => {
        setVisibleLines(0)
        setCurrentText("")
        setIsTyping(true)
      }, 3000)
      return () => clearTimeout(resetTimeout)
    }

    const currentLine = terminalLines[visibleLines]

    if (currentLine.type === "command") {
      // Type out commands character by character
      if (currentText.length < currentLine.text.length) {
        const typeTimeout = setTimeout(
          () => {
            setCurrentText(currentLine.text.slice(0, currentText.length + 1))
          },
          50 + Math.random() * 30,
        )
        return () => clearTimeout(typeTimeout)
      } else {
        // Finished typing, move to next line
        const nextTimeout = setTimeout(() => {
          setVisibleLines((prev) => prev + 1)
          setCurrentText("")
        }, 400)
        return () => clearTimeout(nextTimeout)
      }
    } else {
      // Output lines appear instantly with a small delay
      const outputTimeout = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
        setCurrentText("")
      }, 150)
      return () => clearTimeout(outputTimeout)
    }
  }, [visibleLines, currentText])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 font-mono text-sm shadow-2xl backdrop-blur-sm">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-neutral-800/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-xs text-white/50">younes@dev ~ terminal</span>
      </div>

      {/* Terminal content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="space-y-1">
          {terminalLines.slice(0, visibleLines).map((line, index) => (
            <div
              key={index}
              className={`transition-opacity duration-200 ${
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
          {visibleLines < terminalLines.length && terminalLines[visibleLines].type === "command" && (
            <div className="text-emerald-400">
              {currentText}
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            </div>
          )}

          {/* Cursor when idle */}
          {visibleLines < terminalLines.length && terminalLines[visibleLines].type !== "command" && (
            <div className="text-emerald-400">
              <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            </div>
          )}
        </div>
      </div>

      {/* Terminal footer */}
      <div className="border-t border-white/10 bg-neutral-800/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>zsh</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            connected
          </span>
        </div>
      </div>
    </div>
  )
}
