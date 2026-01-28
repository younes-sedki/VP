"use client"

import Link from "next/link"
import { ArrowLeft, Clock, User, ArrowRight } from "lucide-react"
import { useState } from "react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"

const allBlogPosts = [
  {
    id: 1,
    title: "Building Scalable DevOps Pipelines with Docker and GitHub Actions",
    excerpt: "Learn how to create robust CI/CD pipelines that scale with your application. In this guide, we explore Docker containerization, GitHub Actions workflows, and deployment best practices.",
    content: "Learn how to create robust CI/CD pipelines that scale with your application. In this comprehensive guide, we explore Docker containerization, GitHub Actions workflows, and deployment best practices for production-ready systems.",
    author: "Younes SEDKI",
    date: "2024-12-15",
    readTime: "8 min read",
    category: "DevOps",
    tags: ["Docker", "CI/CD", "GitHub Actions", "DevOps"],
  },
  {
    id: 2,
    title: "Authentication Best Practices in Modern Web Applications",
    excerpt: "A deep dive into secure authentication systems. Covering JWT, bcrypt, session management, 2FA, and common security pitfalls to avoid.",
    content: "A deep dive into secure authentication systems. We cover JWT tokens, bcrypt password hashing, session management strategies, two-factor authentication, and the common security pitfalls you should avoid in your applications.",
    author: "Younes SEDKI",
    date: "2024-11-28",
    readTime: "10 min read",
    category: "Security",
    tags: ["Authentication", "Security", "JWT", "Backend"],
  },
  {
    id: 3,
    title: "Real-Time Applications with WebSockets and Node.js",
    excerpt: "Building real-time features using WebSockets. We'll explore Socket.io, event-driven architecture, and scaling considerations for live applications.",
    content: "Building real-time features using WebSockets. We'll explore Socket.io implementation, event-driven architecture patterns, broadcasting mechanisms, and scaling considerations for live applications handling thousands of concurrent users.",
    author: "Younes SEDKI",
    date: "2024-11-10",
    readTime: "12 min read",
    category: "Backend",
    tags: ["WebSocket", "Node.js", "Real-time", "Socket.io"],
  },
  {
    id: 4,
    title: "Next.js 15: New Features and Performance Improvements",
    excerpt: "Exploring the latest Next.js 15 features including App Router enhancements, Server Components, and new performance optimizations for faster builds.",
    content: "Exploring the latest Next.js 15 features including enhanced App Router, improved Server Components, streaming SSR, and new performance optimizations that make your builds faster and applications more efficient.",
    author: "Younes SEDKI",
    date: "2024-10-22",
    readTime: "9 min read",
    category: "Frontend",
    tags: ["Next.js", "React", "Performance", "Frontend"],
  },
  {
    id: 5,
    title: "Database Optimization: Indexing and Query Performance",
    excerpt: "Master database optimization techniques. Learn about indexes, query planning, and strategies to dramatically improve database performance.",
    content: "Master database optimization techniques that can improve query performance by orders of magnitude. We'll explore indexing strategies, query planning, connection pooling, and caching techniques for optimal database performance.",
    author: "Younes SEDKI",
    date: "2024-09-15",
    readTime: "11 min read",
    category: "Backend",
    tags: ["Database", "PostgreSQL", "Performance", "Optimization"],
  },
  {
    id: 6,
    title: "Microservices Architecture: Design Patterns and Best Practices",
    excerpt: "A comprehensive guide to microservices. Covering service design, API gateways, messaging, monitoring, and deployment strategies.",
    content: "A comprehensive guide to building microservices architectures. We cover service design patterns, API gateway implementation, asynchronous messaging, distributed tracing, monitoring, and deployment strategies for complex systems.",
    author: "Younes SEDKI",
    date: "2024-08-30",
    readTime: "14 min read",
    category: "Architecture",
    tags: ["Microservices", "Architecture", "Backend", "DevOps"],
  },
]

const categories = ["All", ...Array.from(new Set(allBlogPosts.map(p => p.category)))]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredPosts = selectedCategory === "All"
    ? allBlogPosts
    : allBlogPosts.filter(p => p.category === selectedCategory)

  return (
    <main className="bg-neutral-950 text-white min-h-screen" id="main-content">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <section className="px-4 pt-8 pb-12" aria-label="Blog header">
        <div className="mx-auto max-w-4xl">
          <RevealOnView as="div" intensity="medium" className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back Home
              </Button>
            </Link>
          </RevealOnView>

          <RevealOnView as="div" intensity="medium">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">BLOG</h1>
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-emerald-500 opacity-75" />
              </div>
            </div>
            <p className="text-white/60 text-lg">
              Articles and insights about web development, DevOps, and software engineering.
            </p>
          </RevealOnView>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-12" aria-label="Filter blog posts">
        <div className="mx-auto max-w-4xl">
          <RevealOnView as="div" intensity="medium" className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </RevealOnView>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-4 pb-20" aria-label="Blog posts list">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <RevealOnView key={post.id} as="div" intensity="medium" delay={index * 0.05}>
                <article className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/60 p-6 transition-all hover:border-white/30 hover:bg-neutral-900/80">
                  {/* Texture background */}
                  <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                    <DotGridShader />
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="flex-1">
                        <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 mb-3">
                          {post.category}
                        </span>
                        <h2 className="text-xl font-semibold mb-2 hover:text-emerald-400 transition-colors">
                          {post.title}
                        </h2>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/60 text-sm mb-4">
                      {post.excerpt}
                    </p>

                    {/* Meta information */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-4 text-xs text-white/50">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4" aria-hidden="true" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          <span>{post.readTime}</span>
                        </div>
                        <time dateTime={post.date} className="flex items-center gap-1.5">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-fit gap-2 text-emerald-400 hover:text-emerald-300"
                      >
                        <a href={`#`}>
                          Read More
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </RevealOnView>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <RevealOnView as="div" intensity="medium" className="text-center py-12">
              <p className="text-white/60">No posts found in this category.</p>
            </RevealOnView>
          )}
        </div>
      </section>
    </main>
  )
}
