import Link from "next/link"
import { ArrowRight, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import DotGridShader from "@/components/DotGridShader"

export default function NotFound() {
  return (
    <main className="bg-neutral-950 text-white min-h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900/60 p-12 text-center">
        {/* Texture background */}
        <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
          <DotGridShader />
        </div>

        <div className="relative z-10">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl font-black text-emerald-500/20">404</h1>
          </div>

          {/* Error Message */}
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Looks like you're lost
          </h2>
          
          <p className="mb-8 text-lg text-white/70 max-w-md mx-auto">
            The page you're looking for isn't available. It might have been moved, deleted, or never existed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/" aria-label="Go back to home page">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
