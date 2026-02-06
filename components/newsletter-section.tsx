"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // Call API route to subscribe and send welcome email
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to subscribe. Please try again.")
        setIsLoading(false)
        return
      }

      setSubmitted(true)
      setEmail("")

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error("Subscription error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="px-4 py-8" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-6xl">
        <RevealOnView
          as="div"
          intensity="soft"
          className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/40 p-6 backdrop-blur-sm"
        >
          {/* Texture background */}
          <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
            <DotGridShader />
          </div>

          <div className="relative z-10">
            <div className="mb-4">
              <h3 id="newsletter-heading" className="mb-1 text-sm font-bold text-white">Subscribe to my newsletter</h3>
              <p className="text-xs text-white/60">
                Get exclusive insights about my work, projects, and lessons learned.
              </p>
            </div>

            {submitted ? (
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                <CheckCircle2 className="h-5 w-5 text-white/60 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-white">Thank you for subscribing!</p>
                  <p className="text-xs text-white/60">Check your email to confirm.</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 border border-red-500/30">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex-1 rounded-lg border-2 border-white/20 bg-neutral-900/50 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none transition-colors text-sm"
                    aria-label="Email address for newsletter subscription"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="rounded-lg bg-white text-neutral-950 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium px-6 h-10"
                    aria-label="Subscribe to newsletter"
                  >
                    {isLoading ? "..." : "Subscribe"}
                  </Button>
                </div>
                <p className="text-xs text-white/40">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
