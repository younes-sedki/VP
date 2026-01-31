'use client'

import { ArrowRight, Code, Sparkles, TrendingUp, Users, Target } from 'lucide-react'
import Link from 'next/link'

const suggestions = [
  {
    icon: Code,
    title: 'Full-Stack Development',
    description: 'Building modern web applications with React, Next.js, and TypeScript.',
    href: '/blog',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    icon: TrendingUp,
    title: 'Performance Optimization',
    description: 'Making apps faster, more efficient, and scalable.',
    href: '/blog',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    icon: Users,
    title: 'Community & Open Source',
    description: 'Contributing to open source and building in public.',
    href: '/blog',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    icon: Target,
    title: 'Product Building',
    description: 'From idea to launch - sharing the journey of building products.',
    href: '/blog',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
]

export default function HomeSuggestions() {
  return (
    <section className="px-4 py-16 lg:py-24" aria-label="What I do">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-3xl font-black tracking-tight text-white">
              What I'm Building
            </h2>
          </div>
          <p className="text-white/60 max-w-2xl mx-auto">
            Exploring new technologies, sharing learnings, and building products that solve real problems.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon
            return (
              <Link
                key={index}
                href={suggestion.href}
                className={`group relative p-6 rounded-2xl border ${suggestion.borderColor} ${suggestion.bgColor} hover:border-opacity-60 transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${suggestion.bgColor} ${suggestion.borderColor} border group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${suggestion.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {suggestion.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium"
          >
            Explore Blog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
