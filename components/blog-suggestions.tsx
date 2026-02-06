'use client'

import { Sparkles, Code, Zap, BookOpen, Lightbulb, Rocket, Database, Shield, GitBranch, Globe, Terminal, Cpu } from 'lucide-react'
import Link from 'next/link'

const suggestions = [
  {
    icon: Code,
    title: 'Web Development Tips',
    description: 'Learn modern web development practices, frameworks, and best practices.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    icon: Zap,
    title: 'AI & Machine Learning',
    description: 'Explore AI tools, prompts, and how to integrate AI into your projects.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    icon: Rocket,
    title: 'Startup & Product Building',
    description: 'Insights on building products, launching startups, and growing your audience.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    icon: BookOpen,
    title: 'Learning Resources',
    description: 'Curated resources, tutorials, and courses to level up your skills.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  {
    icon: Lightbulb,
    title: 'Developer Productivity',
    description: 'Tools, workflows, and techniques to boost your development efficiency.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    icon: Database,
    title: 'Database & Backend',
    description: 'Database design, optimization, and backend architecture patterns.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    icon: Shield,
    title: 'Security Best Practices',
    description: 'Web security, authentication, and protecting your applications.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  {
    icon: GitBranch,
    title: 'DevOps & CI/CD',
    description: 'Deployment strategies, automation, and infrastructure as code.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    icon: Globe,
    title: 'Web Performance',
    description: 'Optimizing load times, Core Web Vitals, and user experience.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    icon: Terminal,
    title: 'Command Line & Tools',
    description: 'Terminal tips, CLI tools, and developer utilities.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
]

export default function BlogSuggestions() {
  return (
    <section id="blog-topics" className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Explore Topics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon
          return (
            <div
              key={index}
              className={`group relative p-4 rounded-xl border ${suggestion.borderColor} ${suggestion.bgColor} hover:border-opacity-60 transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${suggestion.bgColor} ${suggestion.borderColor} border`}>
                  <Icon className={`w-5 h-5 ${suggestion.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <p className="text-xs text-white/40 text-center mt-6">
        More content coming soon. Stay tuned for updates!
      </p>
    </section>
  )
}
