"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import AnimatedHeading from "@/components/animated-heading"
import { BlogTweetSection } from "@/components/blog-tweet-section"

export default function BlogPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <AnimatedHeading
            className="text-4xl font-black leading-tight tracking-tight sm:text-5xl"
            lines={["Building in public", "and sharing the process"]}
          />
          <p className="max-w-2xl text-white/70 text-sm sm:text-base">
            This space is a hybrid between a blog and a live twitter-style feed. I share quick
            updates, experiments, and technical notes directly from my custom twitter-clone
            engine.
          </p>
        </header>

        <BlogTweetSection />
      </div>
    </main>
  )
}

