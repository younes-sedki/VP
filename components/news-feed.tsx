'use client'

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Sparkles, Code, Brain, TrendingUp } from 'lucide-react'
import { useNews } from '@/hooks/use-news'
import { NewsItem } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsFeedProps {
  category?: 'all' | 'webdev' | 'ai' | 'tech'
  limit?: number
  showCategoryFilter?: boolean
}

const categoryIcons = {
  webdev: Code,
  ai: Brain,
  tech: TrendingUp,
  general: Sparkles,
}

const categoryColors = {
  webdev: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ai: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  tech: 'bg-green-500/10 text-green-400 border-green-500/20',
  general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export default function NewsFeed({ 
  category = 'all', 
  limit = 15,
  showCategoryFilter = true 
}: NewsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'webdev' | 'ai' | 'tech'>(category)
  const { news, loading, error, refetch } = useNews({ 
    category: selectedCategory, 
    limit,
    autoFetch: true 
  })

  const getCategoryIcon = (itemCategory: NewsItem['category']) => {
    const Icon = categoryIcons[itemCategory] || categoryIcons.general
    return <Icon className="w-4 h-4" />
  }

  const getCategoryColor = (itemCategory: NewsItem['category']) => {
    return categoryColors[itemCategory] || categoryColors.general
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showCategoryFilter && (
        <div className="flex flex-wrap gap-2 px-4">
          {(['all', 'webdev', 'ai', 'tech'] as const).map((cat) => {
            const Icon = categoryIcons[cat === 'all' ? 'general' : cat]
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{cat === 'all' ? 'All News' : cat}</span>
              </button>
            )
          })}
        </div>
      )}

      {loading && news.length === 0 ? (
        <div className="px-4 py-10 text-center text-white/60 text-sm">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white/30 mb-2"></div>
          <p>Loading news...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="px-4 py-10 text-center text-white/60 text-sm">
          No news available at the moment.
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="group"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {item.imageUrl && (
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-white/90">
                          {item.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                      </div>
                      
                      {item.description && (
                        <p className="text-white/60 text-xs line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 flex-wrap text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{item.source}</span>
                          {item.author && (
                            <>
                              <span>•</span>
                              <span>{item.author}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-white/30">
                            {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${getCategoryColor(item.category)}`}>
                            {getCategoryIcon(item.category)}
                            <span className="capitalize">{item.category}</span>
                          </span>
                        </div>
                      </div>
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/50 border border-white/10"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {loading && news.length > 0 && (
        <div className="px-4 py-4 text-center text-white/60 text-xs">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white/30"></div>
        </div>
      )}
    </div>
  )
}
