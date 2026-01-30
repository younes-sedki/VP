'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sanitizeHtml } from '@/lib/validation'

interface RichTextContentProps {
  content: string
  className?: string
}

export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  // Auto-link URLs
  const linkify = (text: string): string => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, (url) => `[${url}](${url})`)
  }

  // Auto-link mentions (@username)
  const mentionify = (text: string): string => {
    return text.replace(/@(\w+)/g, '[@$1](/user/$1)')
  }

  // Process content
  const processedContent = mentionify(linkify(content))

  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize link styling
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            />
          ),
          // Customize code blocks
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className
            return isInline ? (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-white/5 p-3 rounded-lg overflow-x-auto" {...props}>
                {children}
              </code>
            )
          },
          // Customize strong/bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white" {...props} />
          ),
          // Customize emphasis/italic
          em: ({ node, ...props }) => (
            <em className="italic text-white/90" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
