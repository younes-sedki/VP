import Link from "next/link"
import { ArrowRight, Home, Search, BookOpen, Compass, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import DotGridShader from "@/components/DotGridShader"

export default function NotFound() {
  return (
    <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900/60 p-8 md:p-12">
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          <div className="relative z-10">
            {/* 404 Number with gradient */}
            <div className="mb-8 text-center">
              <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent leading-none">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Compass className="w-6 h-6 text-emerald-400" />
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Page Not Found
                </h2>
              </div>
              
              <p className="text-lg text-white/70 max-w-md mx-auto mb-2">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-sm text-white/50 max-w-md mx-auto">
                Don't worry, let's get you back on track!
              </p>
            </div>

            {/* Quick Links */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                  Quick Links
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <Link
                  href="/"
                  className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <Home className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                      Home
                    </div>
                    <div className="text-xs text-white/50">Back to homepage</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
                
                <Link
                  href="/blog"
                  className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                      Blog
                    </div>
                    <div className="text-xs text-white/50">Read latest posts</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <Link href="/" aria-label="Go back to home page">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-emerald-500/50 bg-transparent hover:bg-emerald-500/10 hover:border-emerald-500 text-emerald-400">
                <Link href="/blog" aria-label="Go to blog">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore Blog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Helpful Message */}
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                If you believe this is an error, please check the URL or navigate using the links above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
