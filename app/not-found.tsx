'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Home, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DotGridShader from '@/components/DotGridShader'

const terminalLines = [
  { type: 'command', text: '$ cd /requested-page' },
  { type: 'error', text: 'bash: cd: /requested-page: No such file or directory' },
  { type: 'command', text: '$ find / -name "page" -type f' },
  { type: 'output', text: 'Searching...' },
  { type: 'error', text: '0 results found.' },
  { type: 'command', text: '$ echo $?' },
  { type: 'output', text: '404' },
  { type: 'command', text: '$ cat /var/log/suggestions.txt' },
  { type: 'success', text: '→ Try going back to the homepage' },
  { type: 'success', text: '→ Or explore the blog instead' },
]

export default function NotFound() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [showButtons, setShowButtons] = useState(false)

  const animateStep = useCallback(() => {
    if (visibleLines >= terminalLines.length) {
      setTimeout(() => setShowButtons(true), 300)
      return
    }

    const line = terminalLines[visibleLines]

    if (line.type === 'command') {
      if (currentText.length < line.text.length) {
        setTimeout(() => {
          setCurrentText(line.text.slice(0, currentText.length + 1))
        }, 40)
      } else {
        setTimeout(() => {
          setVisibleLines((p) => p + 1)
          setCurrentText('')
        }, 300)
      }
    } else {
      setTimeout(() => {
        setVisibleLines((p) => p + 1)
        setCurrentText('')
      }, 120)
    }
  }, [visibleLines, currentText])

  useEffect(() => {
    animateStep()
  }, [animateStep])

  return (
    <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900/60">
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          {/* Terminal title bar */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">younes@portfolio: ~</span>
          </div>

          {/* Terminal body */}
          <div className="relative z-10 p-6 md:p-8 font-mono text-sm space-y-1 min-h-[280px]">
            {terminalLines.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={`leading-relaxed ${
                  line.type === 'command'
                    ? 'text-white'
                    : line.type === 'error'
                    ? 'text-red-400'
                    : line.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-white/60'
                }`}
              >
                {line.text}
              </div>
            ))}

            {/* Currently typing line */}
            {visibleLines < terminalLines.length &&
              terminalLines[visibleLines].type === 'command' && (
                <div className="text-white">
                  {currentText}
                  <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                </div>
              )}

            {/* Blinking cursor after all done */}
            {visibleLines >= terminalLines.length && (
              <div className="text-white/60">
                $ <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
              </div>
            )}
          </div>

          {/* Action buttons — fade in after animation */}
          <div
            className={`relative z-10 px-6 md:px-8 pb-6 md:pb-8 flex flex-col sm:flex-row gap-3 transition-all duration-500 ${
              showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Button asChild size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-emerald-500/50 bg-transparent hover:bg-emerald-500/10 hover:border-emerald-500 text-emerald-400"
            >
              <Link href="/blog">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
