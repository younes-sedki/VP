import Link from "next/link"
import { ArrowRight, Home, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import DotGridShader from "@/components/DotGridShader"

export default function NotFound() {
  return (
    <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900/60 p-8 md:p-10">
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          <div className="relative z-10 text-center">
            {/* 404 Number with gradient */}
            <div className="mb-6">
              <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent leading-none">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Page Not Found
              </h2>
              <p className="text-white/70 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
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
          </div>
        </div>
      </div>
    </main>
  )
}
